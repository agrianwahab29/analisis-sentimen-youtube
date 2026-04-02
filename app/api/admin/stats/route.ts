import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

/**
 * GET /api/admin/stats
 * 
 * Returns dashboard statistics for admin
 * Only accessible by admin (agrianwahab10@gmail.com)
 */

export async function GET(request: NextRequest) {
  try {
    // Step 1: Verify admin via session (using route handler client)
    const { supabase: sessionClient } = await createSupabaseRouteHandlerClient();
    const { data: { user }, error: sessionError } = await sessionClient.auth.getUser();
    
    if (sessionError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.email !== "agrianwahab10@gmail.com") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Step 2: Use service role for database operations (bypass RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials:", { url: !!supabaseUrl, key: !!supabaseServiceKey });
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get statistics
    const [
      totalUsers,
      pendingApproval,
      suspendedUsers,
      activeUsers,
      transactionsResult,
      pendingVerification,
      totalRevenueResult,
      monthRevenueResult
    ] = await Promise.all([
      // Total users
      supabase.from("users").select("*", { count: "exact", head: true }),
      
      // Pending approval (unapproved users)
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false),
      
      // Suspended users
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_suspended", true),
      
      // Active users (approved and not suspended)
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true)
        .eq("is_suspended", false),
      
      // Total transactions
      supabase.from("transactions").select("*", { count: "exact", head: true }),
      
      // Pending verification
      supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "pending_verification"),
      
      // Total revenue (paid transactions)
      supabase
        .from("transactions")
        .select("price", { count: "exact" })
        .eq("payment_status", "paid"),
      
      // Revenue this month
      supabase
        .from("transactions")
        .select("price", { count: "exact" })
        .eq("payment_status", "paid")
        .gte("created_at", new Date(new Date().setDate(1)).toISOString())
    ]);

    // Calculate revenue totals
    const totalRevenueData = totalRevenueResult.data || [];
    const totalRevenueAmount = totalRevenueData.reduce((sum: number, t: any) => sum + (t.price || 0), 0);
    
    const monthRevenueData = monthRevenueResult.data || [];
    const revenueThisMonthAmount = monthRevenueData.reduce((sum: number, t: any) => sum + (t.price || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        total_users: totalUsers.count || 0,
        pending_approval: pendingApproval.count || 0,
        suspended_users: suspendedUsers.count || 0,
        active_users: activeUsers.count || 0,
        total_transactions: transactionsResult.count || 0,
        pending_verification: pendingVerification.count || 0,
        total_revenue: totalRevenueAmount,
        revenue_this_month: revenueThisMonthAmount,
      },
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
