import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * POST /api/topup/generate
 * 
 * Creates a transaction record with unique voucher code
 * For WhatsApp GoPay payments
 */

export async function POST(request: Request) {
  try {
    // Create Supabase client
    const { supabase } = await createSupabaseRouteHandlerClient();

    // Get current user
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      console.error("Auth error:", sessionError);
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Check if user is approved and not suspended
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("is_approved, is_suspended, suspension_reason")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("User fetch error:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 }
      );
    }

    if (userData.is_suspended) {
      return NextResponse.json(
        { error: `Account suspended: ${userData.suspension_reason || "Contact admin"}` },
        { status: 403 }
      );
    }

    if (!userData.is_approved) {
      return NextResponse.json(
        { error: "Account pending approval - Contact admin" },
        { status: 403 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID required" },
        { status: 400 }
      );
    }

    // Package definitions
    const packages = {
      basic: { price: 10000, credits: 100, bonus: 0, name: "Basic" },
      standard: { price: 25000, credits: 300, bonus: 20, name: "Standard" },
      premium: { price: 50000, credits: 700, bonus: 200, name: "Premium" },
      enterprise: { price: 100000, credits: 1500, bonus: 500, name: "Enterprise" },
    };

    const pkg = packages[packageId as keyof typeof packages];
    if (!pkg) {
      return NextResponse.json(
        { error: "Invalid package" },
        { status: 400 }
      );
    }

    // Generate unique voucher code
    const voucherCode = generateVoucherCode();
    const orderId = `TOPUP-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;

    // Create transaction record
    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        order_id: orderId,
        package_id: packageId,
        package_name: pkg.name,
        credits_amount: pkg.credits,
        bonus_credits: pkg.bonus,
        total_credits: pkg.credits + pkg.bonus,
        price: pkg.price,
        payment_method: "whatsapp_gopay",
        payment_status: "pending_verification",
        voucher_code: voucherCode,
        whatsapp_number: "082291134197",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Transaction insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create transaction", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction_id: transaction.id,
      order_id: orderId,
      voucher_code: voucherCode,
      package: {
        id: packageId,
        name: pkg.name,
        price: pkg.price,
        credits: pkg.credits,
        bonus: pkg.bonus,
        total_credits: pkg.credits + pkg.bonus,
      },
      message: "Transaction created successfully",
    });

  } catch (error) {
    console.error("Generate transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * Generate unique voucher code
 * Format: VID-XXXXXX (6 alphanumeric chars)
 */
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VID-";
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}
