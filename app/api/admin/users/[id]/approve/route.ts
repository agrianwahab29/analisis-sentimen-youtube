import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/users/[id]/approve
 * 
 * Approve a user (set is_approved = true)
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

    // Update user approval status
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_approved: true })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to approve user:", updateError);
      return NextResponse.json(
        { error: "Failed to approve user" },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from("admin_activity").insert({
      admin_id: user.id,
      action: "approve_user",
      target_user_id: userId,
      details: { approved: true },
    });

    return NextResponse.json({
      success: true,
      message: "User approved successfully",
      user_id: userId,
    });

  } catch (error) {
    console.error("Approve user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
