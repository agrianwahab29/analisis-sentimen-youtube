import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/users/[id]/credits
 * 
 * Add credits to a user manually
 * Only accessible by admin (agrianwahab10@gmail.com)
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Step 1: Verify admin via session
    const { supabase: sessionClient } = await createSupabaseRouteHandlerClient();
    const { data: { user }, error: sessionError } = await sessionClient.auth.getUser();
    
    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    if (user.email !== "agrianwahab10@gmail.com") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Step 2: Use service role for database operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { id: userId } = await params;
    const body = await request.json();
    const { credits, notes = "Manual credit from admin" } = body;

    if (!credits || typeof credits !== "number" || credits <= 0) {
      return NextResponse.json(
        { error: "Invalid credits amount" },
        { status: 400 }
      );
    }

    // Get current user credits
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update credits
    const newBalance = (userData.credit_balance || 0) + credits;
    const { error: updateError } = await supabase
      .from("users")
      .update({ credit_balance: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to add credits:", updateError);
      return NextResponse.json(
        { error: "Failed to add credits" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "add_credits",
      target_id: userId,
      metadata: { credits_added: credits, new_balance: newBalance, notes },
    });

    return NextResponse.json({
      success: true,
      message: `Added ${credits} credits to user`,
      user_id: userId,
      credits_added: credits,
      new_balance: newBalance,
    });

  } catch (error) {
    console.error("Add credits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
