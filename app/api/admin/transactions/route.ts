import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin/transactions
 * 
 * Returns list of all transactions for admin dashboard
 * Only accessible by admin (agrianwahab10@gmail.com)
 * 
 * Query params:
 * - status: 'pending' | 'pending_verification' | 'paid' | 'failed' | 'rejected'
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 */

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with SERVICE ROLE KEY (bypass RLS)
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
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query - fetch ALL transactions
    let query = supabase
      .from("transactions")
      .select(`
        *,
        users!inner (
          email,
          name
        )
      `, { count: "exact" });

    // Add status filter
    if (status) {
      query = query.eq("payment_status", status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false });

    const { data: transactions, error: fetchError, count } = await query;

    if (fetchError) {
      console.error("Failed to fetch transactions:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch transactions", details: fetchError.message },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedTransactions = transactions?.map((t) => ({
      ...t,
      user_email: t.users?.email || "Unknown",
      user_name: t.users?.name || "Unknown",
    })) || [];

    return NextResponse.json({
      success: true,
      transactions: transformedTransactions,
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error("Admin transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
