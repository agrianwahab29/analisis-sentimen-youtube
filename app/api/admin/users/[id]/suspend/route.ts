import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/users/[id]/suspend
 * 
 * Suspend or unsuspend a user
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

    const { data: userData } = await sessionClient
      .from("users")
      .select("role,email")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin =
      userData?.role === "admin" || user.email === "agrianwahab10@gmail.com";

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
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
    const { action, reason = "" } = body;

    if (!action || !["suspend", "unsuspend"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'suspend' or 'unsuspend'" },
        { status: 400 }
      );
    }

    if (action === "suspend") {
      // Update user to suspended
      const { error: suspendError } = await supabase
        .from("users")
        .update({ 
          is_suspended: true, 
          suspension_reason: reason 
        })
        .eq("id", userId);

      if (suspendError) {
        console.error("Failed to suspend user:", suspendError);
        return NextResponse.json(
          { error: "Failed to suspend user" },
          { status: 500 }
        );
      }

      // Log activity
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "suspend_user",
        target_id: userId,
        metadata: { reason },
      });

      return NextResponse.json({
        success: true,
        message: "User suspended successfully",
        user_id: userId,
        reason: reason,
      });
    } else {
      // Unsuspend user
      const { error: unsuspendError } = await supabase
        .from("users")
        .update({ 
          is_suspended: false, 
          suspension_reason: null 
        })
        .eq("id", userId);

      if (unsuspendError) {
        console.error("Failed to unsuspend user:", unsuspendError);
        return NextResponse.json(
          { error: "Failed to unsuspend user" },
          { status: 500 }
        );
      }

      // Log activity
      await supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "unsuspend_user",
        target_id: userId,
        metadata: {},
      });

      return NextResponse.json({
        success: true,
        message: "User unsuspended successfully",
        user_id: userId,
      });
    }

  } catch (error) {
    console.error("Suspend/unsuspend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
