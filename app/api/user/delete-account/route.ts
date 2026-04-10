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

    // Delete user data from analysis_history first (foreign key constraint)
    console.log("Deleting analysis history...");
    const { error: deleteHistoryError } = await supabase
      .from("analysis_history")
      .delete()
      .eq("user_id", user.id);

    if (deleteHistoryError) {
      console.error("Error deleting analysis history:", deleteHistoryError);
      // Continue anyway - maybe no history exists
    }

    // Delete user from users table
    console.log("Deleting user from users table...");
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteUserError) {
      console.error("Error deleting user from users table:", deleteUserError);
      return NextResponse.json(
        { error: "Failed to delete user from database", details: deleteUserError.message },
        { status: 500 }
      );
    }

    // Delete auth user (requires service role key)
    console.log("Deleting auth user with service role...");
    try {
      const adminSupabase = createSupabaseServiceRoleClient();
      const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteAuthError) {
        console.error("Error deleting auth user:", deleteAuthError);
        // Return error details
        return NextResponse.json(
          { error: "Failed to delete auth user", details: deleteAuthError.message },
          { status: 500 }
        );
      }
      console.log("Auth user deleted successfully");
    } catch (serviceRoleError: any) {
      console.error("Service role error:", serviceRoleError);
      return NextResponse.json(
        { error: "Failed to delete auth user", details: serviceRoleError?.message || "Unknown error" },
        { status: 500 }
      );
    }

    // Sign out user
    console.log("Signing out user...");
    await supabase.auth.signOut();

    console.log("Account deletion completed successfully");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
