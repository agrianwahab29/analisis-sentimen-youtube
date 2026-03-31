import { createSupabaseRouteClient } from "@/lib/supabase/server";
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete user data from analysis_history first (foreign key constraint)
    const { error: deleteHistoryError } = await supabase
      .from("analysis_history")
      .delete()
      .eq("user_id", user.id);

    if (deleteHistoryError) {
      console.error("Error deleting analysis history:", deleteHistoryError);
      return NextResponse.json(
        { error: "Failed to delete analysis history" },
        { status: 500 }
      );
    }

    // Delete user from users table
    const { error: deleteUserError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteUserError) {
      console.error("Error deleting user:", deleteUserError);
      return NextResponse.json(
        { error: "Failed to delete user account" },
        { status: 500 }
      );
    }

    // Delete auth user (requires service role key)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey) {
      const adminSupabase = createSupabaseRouteClient(
        request,
        new NextResponse()
      ).supabase;

      // Use service role to delete auth user
      const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteAuthError) {
        console.error("Error deleting auth user:", deleteAuthError);
        // Continue anyway - user data is already deleted
      }
    }

    // Sign out user
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
