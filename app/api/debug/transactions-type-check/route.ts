import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Missing Supabase credentials" },
      { status: 500 }
    );
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await adminClient.rpc(
    "debug_transactions_type_check"
  );

  if (error) {
    return NextResponse.json(
      {
        error: "Failed to read transactions_type_check",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ constraint: data?.[0] ?? null });
}

