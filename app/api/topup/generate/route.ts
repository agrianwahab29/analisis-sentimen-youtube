import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

/**
 * Generate Voucher Code API
 * 
 * Creates a transaction record with unique voucher code
 * User will use this code when paying via Sociabuzz
 */

export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    const { supabase } = createSupabaseRouteClient(request, response);

    // Get current user
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
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
        payment_method: "sociabuzz",
        payment_status: "pending",
        voucher_code: voucherCode,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create transaction:", insertError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    // Generate Sociabuzz payment URL with voucher code in message
    const sociabuzzUrl = `https://sociabuzz.com/agrianwahab/tribe`;
    
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
      payment_instructions: {
        sociabuzz_url: sociabuzzUrl,
        tribe_id: "agrianwahab",
        voucher_code: voucherCode,
        message: `Gunakan kode voucher: ${voucherCode} saat pembayaran`,
        amount: pkg.price,
      },
    });

  } catch (error) {
    console.error("Generate voucher error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generate unique voucher code
 * Format: VID-XXXXXX (6 alphanumeric chars)
 */
function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude I, O, 1, 0 for readability
  let code = "VID-";
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}
