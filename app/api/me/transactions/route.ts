import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

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
