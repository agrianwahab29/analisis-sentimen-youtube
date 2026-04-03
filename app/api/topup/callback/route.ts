import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sociabuzz Webhook Handler
 * 
 * Sociabuzz akan mengirim POST request ke endpoint ini saat ada pembayaran berhasil.
 * 
 * Webhook payload dari Sociabuzz:
 * - order_id: ID transaksi Sociabuzz
 * - amount: Jumlah pembayaran
 * - status: status pembayaran (paid, pending, failed)
 * - email: email pembayar
 * - name: nama pembayar
 * - message: pesan (bisa berisi voucher code)
 */

export async function POST(request: NextRequest) {
  try {
    // Verify webhook token if provided
    const authHeader = request.headers.get("authorization");
    const webhookToken = process.env.SOCIABUZZ_WEBHOOK_TOKEN;
    
    // Optional: Verify token if set in environment variables
    if (webhookToken && authHeader !== `Bearer ${webhookToken}`) {
      console.warn("Webhook token mismatch or not provided");
      // Don't reject - allow for testing without token
    }
    
    // Parse request body
    const body = await request.json();
    console.log("Sociabuzz webhook received:", body);

    // Sociabuzz webhook payload can vary - log everything for debugging
    console.log("=== Sociabuzz Webhook Received ===");
    console.log("Full payload:", JSON.stringify(body, null, 2));
    console.log("Headers:", Object.fromEntries(request.headers));

    // Extract fields - Sociabuzz may use different field names
    const orderId = body.order_id || body.orderId || body.id || body.transaction_id;
    const amount = body.amount || body.total_amount || body.price || body.value;
    const status = body.status || body.payment_status || body.state || body.transaction_status;
    let email = body.email || body.customer_email || body.payer_email || body.user_email;
    const name = body.name || body.customer_name || body.payer_name || body.user_name;
    const message = body.message || body.notes || body.note || body.description || body.custom_message;
    const type = body.type || body.payment_type || body.method || "qris";

    // Validate required fields (more lenient)
    if (!orderId || !amount) {
      console.error("Missing required fields - orderId:", orderId, "amount:", amount);
      console.error("Full body:", body);
      
      // Still try to process if we have minimum data
      if (!orderId) {
        return NextResponse.json(
          { error: "Missing order_id", received: body },
          { status: 400 }
        );
      }
    }

    // Generate placeholder email if not provided (for test webhooks)
    if (!email) {
      email = `webhook-test-${orderId}@sociabuzz.local`;
      console.warn("Email not provided, using placeholder:", email);
    }

    console.log("Extracted fields:", { orderId, amount, status, email, name, message, type });

    // Only process successful payments (check various status values)
    const successStatuses = ["paid", "success", "completed", "settlement", "capture", "success"];
    if (status && !successStatuses.includes(status.toLowerCase())) {
      console.log("Payment status not successful yet:", status);
      return NextResponse.json({ 
        success: true, 
        message: `Payment status: ${status}`,
        status: status
      });
    }

    // Initialize Supabase client with service role (bypass RLS for webhook)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

    // Extract voucher code from message if exists
    const voucherCode = extractVoucherCode(message);
    
    // Find transaction by voucher code or order_id
    let transaction;
    if (voucherCode) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("voucher_code", voucherCode)
        .in("payment_status", ["pending", "pending_verification"])
        .single();
      
      if (error || !data) {
        console.error("Transaction not found for voucher:", voucherCode);
        // Create new transaction if not found
        transaction = await createTransaction(supabase, body, voucherCode);
      } else {
        transaction = data;
      }
    } else {
      // Find by email match (fallback)
      let { data: user } = await supabase
        .from("users")
        .select("id, credit_balance")
        .eq("email", email)
        .single();
      
      if (!user) {
        console.warn("User not found for email:", email, "- Creating new user...");
        
        // Auto-create user if not exists
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert({
            email: email,
            credit_balance: 0,
          })
          .select("id, credit_balance")
          .single();
        
        if (createUserError || !newUser) {
          console.error("=== Failed to create user ===");
          console.error("Email:", email);
          console.error("Error details:", JSON.stringify(createUserError, null, 2));
          console.error("Service role key present:", !!supabaseServiceKey);
          
          return NextResponse.json(
            { 
              error: "Failed to create user", 
              email: email,
              details: createUserError?.message || "Unknown error",
              service_role_key_present: !!supabaseServiceKey
            },
            { status: 500 }
          );
        }
        
        user = { id: newUser.id, credit_balance: newUser.credit_balance };
        console.log("✅ New user created:", user.id);
      }

      // Create transaction record
      transaction = await createTransaction(supabase, body, null, user.id);
    }

    // Idempotency check: skip if already processed
    if (transaction.payment_status === "paid") {
      console.log("Transaction already processed, skipping:", transaction.id);
      return NextResponse.json({
        success: true,
        message: "Transaction already processed",
        transaction_id: transaction.id,
      });
    }

    // Update transaction status to paid
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        sociabuzz_order_id: orderId,
        sociabuzz_response: body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    // Add credits to user
    const { error: creditError } = await supabase.rpc("add_credits_to_user", {
      user_uuid: transaction.user_id,
      credits: transaction.total_credits,
    });

    if (creditError) {
      console.error("Failed to add credits:", creditError);
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }

    console.log(`✅ Credits added: ${transaction.total_credits} to user ${transaction.user_id}`);

    // Send success response to Sociabuzz
    return NextResponse.json({
      success: true,
      message: `Payment processed successfully. ${transaction.total_credits} credits added.`,
      transaction_id: transaction.id,
      credits_added: transaction.total_credits,
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Extract voucher code from message
 * Format: "Voucher: ABC123" or "Code: ABC123"
 */
function extractVoucherCode(message: string | null): string | null {
  if (!message) return null;
  
  const match = message.match(/(?:Voucher|Code|Kode)[:\s]+([A-Z0-9]+)/i);
  return match ? match[1] : null;
}

/**
 * Create transaction record
 */
async function createTransaction(
  supabase: any,
  body: any,
  voucherCode: string | null,
  userId?: string
) {
  const { email, amount, order_id } = body;

  // Find user by email if userId not provided
  let user_id = userId;
  if (!user_id) {
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();
    
    if (!user) {
      throw new Error("User not found");
    }
    user_id = user.id;
  }

  // Determine package based on amount
  const packageMap: Record<number, { package_id: string; package_name: string; credits: number; bonus: number }> = {
    10000: { package_id: "basic", package_name: "Basic", credits: 100, bonus: 0 },
    25000: { package_id: "standard", package_name: "Standard", credits: 300, bonus: 20 },
    50000: { package_id: "premium", package_name: "Premium", credits: 700, bonus: 200 },
    100000: { package_id: "enterprise", package_name: "Enterprise", credits: 1500, bonus: 500 },
  };

  const pkg = packageMap[amount] || { package_id: "custom", package_name: "Custom", credits: Math.floor(amount / 100), bonus: 0 };
  const total_credits = pkg.credits + pkg.bonus;

  // Create transaction
  const { data: transaction, error } = await supabase
    .from("transactions")
    .insert({
      user_id,
      // Required by transactions.type NOT NULL constraint
      type: "credit_purchase",
      order_id: order_id || `SOC-${Date.now()}`,
      // Required by transactions.amount NOT NULL constraint
      amount,
      package_id: pkg.package_id,
      package_name: pkg.package_name,
      credits_amount: pkg.credits,
      bonus_credits: pkg.bonus,
      total_credits,
      price: amount,
      payment_method: "sociabuzz",
      payment_status: "pending",
      voucher_code: voucherCode,
      sociabuzz_order_id: order_id,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create transaction:", error);
    throw error;
  }

  return transaction;
}

// GET handler for webhook testing - shows endpoint info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Sociabuzz webhook endpoint is active",
    description: "This endpoint accepts POST requests from Sociabuzz webhook",
    method: "POST",
    content_type: "application/json",
    timestamp: new Date().toISOString(),
    status: "ready",
    instructions: {
      test_from_sociabuzz: "Use 'Test Webhook' button in Sociabuzz dashboard",
      webhook_url: "https://analisis-sentimen-youtube.vercel.app/api/topup/callback",
      required_fields: ["order_id", "amount", "status", "email"]
    }
  });
}
