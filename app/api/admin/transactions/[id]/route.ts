import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/admin/transactions/[id]
 * 
 * Approve or reject a transaction
 * Only accessible by admin (agrianwahab10@gmail.com)
 * 
 * Body:
 * {
 *   "action": "approve" | "reject",
 *   "reason": "optional reason for rejection"
 * }
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from("users")
      .select("email, role")
      .eq("id", user.id)
      .single();

    if (!userData || userData.email !== "agrianwahab10@gmail.com") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, reason } = body;
    const transactionId = params.id;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get transaction
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // Update transaction status
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          payment_status: "paid",
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (updateError) {
        console.error("Failed to approve transaction:", updateError);
        return NextResponse.json(
          { error: "Failed to approve transaction" },
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
          { error: "Failed to add credits to user" },
          { status: 500 }
        );
      }

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "approve_transaction",
        target_id: transactionId,
        metadata: {
          transaction_id: transactionId,
          user_id: transaction.user_id,
          credits_added: transaction.total_credits,
          package_name: transaction.package_name,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Transaction approved and credits added",
        transaction_id: transactionId,
        credits_added: transaction.total_credits,
      });
    } else {
      // Reject transaction
      const { error: rejectError } = await supabase
        .from("transactions")
        .update({
          payment_status: "rejected",
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (rejectError) {
        console.error("Failed to reject transaction:", rejectError);
        return NextResponse.json(
          { error: "Failed to reject transaction" },
          { status: 500 }
        );
      }

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "reject_transaction",
        target_id: transactionId,
        metadata: {
          transaction_id: transactionId,
          reason: reason || "No reason provided",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Transaction rejected",
        transaction_id: transactionId,
        reason: reason || "No reason provided",
      });
    }

  } catch (error) {
    console.error("Transaction action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
