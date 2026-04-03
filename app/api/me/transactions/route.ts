import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: responseHeaders },
      );
    }

    // Read via service role to avoid RLS/policy mismatches across environments.
    // Still constrained by `user.id` so a user cannot read other users' transactions.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      // Fallback: use the session client (may hit RLS).
      const { data, error } = await supabase
        .from("transactions")
        .select("id, package_name, total_credits, price, payment_status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch transactions", details: error.message },
          { status: 500, headers: responseHeaders },
        );
      }

      return NextResponse.json({ transactions: data ?? [] }, { headers: responseHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await adminClient
      .from("transactions")
      .select("id, package_name, total_credits, price, payment_status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch transactions", details: error.message },
        { status: 500, headers: responseHeaders },
      );
    }

    return NextResponse.json(
      { transactions: data ?? [] },
      { headers: responseHeaders },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
