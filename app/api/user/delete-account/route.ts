import { createSupabaseRouteClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const response = new NextResponse();
    const { supabase } = createSupabaseRouteClient(request, response);

    // Get current user session
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      console.error("Session error:", sessionError);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Soft deleting account for user:", user.id, "email:", user.email);

    // Check if service role key is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error - service role key missing" },
        { status: 500 }
      );
    }

    const adminSupabase = createSupabaseServiceRoleClient();

    // Step 1: SOFT DELETE - Update user record instead of deleting
    // This preserves the record for anti-farming tracking
    console.log("Step 1: Soft deleting user record...");
    try {
      const { error: softDeleteError } = await adminSupabase
        .from("users")
        .update({
          deleted_at: new Date().toISOString(),
          status: "deleted",
          credit_balance: 0,  // Reset kredit
          email: `deleted_${user.id}_${Date.now()}@deleted.vidsense.ai`,  // Mask email
          original_email: user.email,  // Keep original for tracking
        })
        .eq("id", user.id);

      if (softDeleteError) {
        console.error("Error soft deleting user:", softDeleteError.message);
        // Continue - might not exist in users table
      } else {
        console.log("User soft deleted successfully");
      }
    } catch (e: any) {
      console.error("Exception soft deleting user:", e.message);
    }

    // Step 2: Update email registry to mark this email as deleted
    console.log("Step 2: Updating email registry...");
    try {
      const { error: registryError } = await adminSupabase
        .from("email_registry")
        .upsert({
          email: user.email!,
          last_deleted_at: new Date().toISOString(),
          total_deletions: adminSupabase.rpc("increment_deletion_count", { user_email: user.email }),
        }, {
          onConflict: "email"
        });

      if (registryError) {
        console.error("Error updating email registry:", registryError.message);
      } else {
        console.log("Email registry updated");
      }
    } catch (e: any) {
      console.error("Exception updating email registry:", e.message);
      // Fallback: insert/update manual
      try {
        await adminSupabase.rpc("update_email_registry_on_delete", {
          p_email: user.email,
          p_deleted_at: new Date().toISOString(),
        });
      } catch (rpcError: any) {
        console.error("RPC fallback also failed:", rpcError.message);
      }
    }

    // Step 3: Delete analysis history (hard delete - no need to keep)
    console.log("Step 3: Deleting analysis history...");
    try {
      const { error: deleteHistoryError } = await adminSupabase
        .from("analysis_history")
        .delete()
        .eq("user_id", user.id);

      if (deleteHistoryError) {
        console.error("Error deleting analysis history:", deleteHistoryError.message);
      }
    } catch (e: any) {
      console.error("Exception deleting history:", e.message);
    }

    // Step 4: Delete auth user from Supabase Auth
    console.log("Step 4: Deleting auth user...");
    try {
      const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteAuthError) {
        console.error("Error deleting auth user:", deleteAuthError.message);
        return NextResponse.json(
          { 
            error: "Failed to delete auth user", 
            details: deleteAuthError.message,
            step: "auth_delete"
          },
          { status: 500 }
        );
      }
      console.log("Auth user deleted successfully");
    } catch (e: any) {
      console.error("Exception deleting auth user:", e.message);
      return NextResponse.json(
        { 
          error: "Failed to delete auth user", 
          details: e?.message || "Unknown error",
          step: "auth_delete" 
        },
        { status: 500 }
      );
    }

    // Step 5: Sign out user
    console.log("Step 5: Signing out user...");
    try {
      await supabase.auth.signOut();
    } catch (e: any) {
      console.error("Error signing out (non-critical):", e.message);
    }

    console.log("Account soft deletion completed successfully");
    return NextResponse.json({ 
      success: true, 
      message: "Akun dihapus. Jika mendaftar lagi, kredit gratis tidak akan diberikan lagi." 
    });
  } catch (error: any) {
    console.error("Delete account fatal error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error?.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}
