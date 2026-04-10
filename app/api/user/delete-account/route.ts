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

    console.log("Deleting account for user:", user.id);

    // Check if service role key is available
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error - service role key missing" },
        { status: 500 }
      );
    }

    // Use service role client for all delete operations
    const adminSupabase = createSupabaseServiceRoleClient();

    // Step 1: Delete all related data first (to avoid FK constraint violations)
    // Using service role client to bypass RLS policies
    console.log("Step 1: Deleting analysis history...");
    try {
      const { error: deleteHistoryError } = await adminSupabase
        .from("analysis_history")
        .delete()
        .eq("user_id", user.id);

      if (deleteHistoryError) {
        console.error("Error deleting analysis history:", deleteHistoryError.message);
        // Continue - maybe no history exists
      } else {
        console.log("Analysis history deleted successfully");
      }
    } catch (e: any) {
      console.error("Exception deleting history:", e.message);
    }

    // Step 2: Delete user from users table
    console.log("Step 2: Deleting user from users table...");
    try {
      const { error: deleteUserError } = await adminSupabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteUserError) {
        console.error("Error deleting user from users table:", deleteUserError.message);
        // Continue anyway - user might not exist in users table
      } else {
        console.log("User deleted from users table successfully");
      }
    } catch (e: any) {
      console.error("Exception deleting from users table:", e.message);
    }

    // Step 3: Delete auth user from Supabase Auth
    console.log("Step 3: Deleting auth user...");
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
            code: deleteAuthError.status 
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

    // Step 4: Sign out user (optional at this point since auth user is deleted)
    console.log("Step 4: Signing out user...");
    try {
      await supabase.auth.signOut();
    } catch (e: any) {
      console.error("Error signing out (non-critical):", e.message);
    }

    console.log("Account deletion completed successfully");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete account fatal error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error?.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error?.stack : undefined 
      },
      { status: 500 }
    );
  }
}
