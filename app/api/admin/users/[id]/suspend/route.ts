import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/admin/users/[id]/suspend
 * 
 * Suspend or unsuspend a user
 * Only accessible by admin (agrianwahab10@gmail.com)
 * 
 * Body: { action: "suspend" | "unsuspend", reason?: string }
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Initialize Supabase client with service role
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from params
    const { id: userId } = await params;

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
    const { action, reason = "" } = body;

    if (!action || !["suspend", "unsuspend"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'suspend' or 'unsuspend'" },
        { status: 400 }
      );
    }

    let result;

    if (action === "suspend") {
      // Call suspend_user function
      const { error: suspendError } = await supabase.rpc("suspend_user", {
        user_uuid: userId,
        reason: reason,
      });

      if (suspendError) {
        console.error("Failed to suspend user:", suspendError);
        return NextResponse.json(
          { error: "Failed to suspend user" },
          { status: 500 }
        );
      }

      result = {
        success: true,
        message: "User suspended successfully",
        user_id: userId,
        reason: reason,
      };
    } else {
      // Call unsuspend_user function
      const { error: unsuspendError } = await supabase.rpc("unsuspend_user", {
        user_uuid: userId,
      });

      if (unsuspendError) {
        console.error("Failed to unsuspend user:", unsuspendError);
        return NextResponse.json(
          { error: "Failed to unsuspend user" },
          { status: 500 }
        );
      }

      result = {
        success: true,
        message: "User unsuspended successfully",
        user_id: userId,
      };
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Suspend/unsuspend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
