import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/users
 * 
 * Returns list of all users for admin dashboard
 * Only accessible by admin (agrianwahab10@gmail.com)
 * 
 * Query params:
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - search: string (search by email or name)
 */

export async function GET(request: NextRequest) {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    // Build query
    let query = supabase
      .from("users")
      .select("id, email, name, created_at, credit_balance, role", { count: "exact" });

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
        { error: "Failed to fetch users" },
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
