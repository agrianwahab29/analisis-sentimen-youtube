import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

/**
 * DELETE /api/admin/users/[id]
 * 
 * Delete a user (soft or hard delete)
 * Only accessible by admin (agrianwahab10@gmail.com)
 * 
 * Query param: ?hard=true (optional, for hard delete)
 */

export async function DELETE(
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

    // Get user ID from params
    const { id: userId } = await params;

    // Check if trying to delete self
    if (user.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
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

    // Check for hard delete query param
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    if (hardDelete) {
      // Hard delete: delete all related data first, then users
      // Order matters due to FK constraints (all ON DELETE NO ACTION)
      const deleteResults = await Promise.all([
        supabase.from("analysis_history").delete().eq("user_id", userId),
        supabase.from("transactions").delete().eq("user_id", userId),
        supabase.from("sociabuzz_webhooks").delete().eq("user_id", userId),
      ]);

      const relErrors = deleteResults.filter(r => r.error);
      if (relErrors.length > 0) {
        console.error("Failed to delete user related data:", relErrors.map(r => r.error));
      }

      const { error: deleteError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (deleteError) {
        console.error("Failed to delete user:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete user" },
          { status: 500 }
        );
      }

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "hard_delete_user",
        target_id: userId,
        metadata: { action: "hard_delete_user", user_id: userId }
      });
    } else {
      // Soft delete: mark as suspended
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_suspended: true,
          suspension_reason: "Account deleted by admin",
          suspended_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Failed to suspend user:", updateError);
        return NextResponse.json(
          { error: "Failed to delete user" },
          { status: 500 }
        );
      }

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "soft_delete_user",
        target_id: userId,
        metadata: { action: "soft_delete_user", user_id: userId }
      });
    }

    return NextResponse.json({
      success: true,
      message: hardDelete 
        ? "User permanently deleted" 
        : "User account deactivated (soft delete)",
      user_id: userId,
      hard_delete: hardDelete,
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
