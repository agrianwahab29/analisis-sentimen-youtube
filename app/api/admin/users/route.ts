import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/users
 * 
 * Returns list of all users for admin dashboard
 * Only accessible by admin (agrianwahab10@gmail.com)
 */

export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    // Build query
    let query = supabase
      .from("users")
      .select("id, email, created_at, credit_balance, role, is_approved, is_suspended, suspension_reason", { count: "exact" })
      .neq("suspension_reason", "Account deleted by admin");

    // Add search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    const { data: users, error: fetchError, count } = await query;

    if (fetchError) {
      console.error("Failed to fetch users:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch users", details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
