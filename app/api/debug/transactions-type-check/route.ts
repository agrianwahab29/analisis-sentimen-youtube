import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Security: Debug endpoints should not be accessible in production without secret
function isDebugAllowed(request: Request): boolean {
  // Always allow in development
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  
  // In production, require DEBUG_SECRET header
  const debugSecret = request.headers.get("x-debug-secret");
  return debugSecret === process.env.DEBUG_SECRET;
}

export async function GET(request: Request) {
  // Security check
  if (!isDebugAllowed(request)) {
    return NextResponse.json(
      { error: "Debug endpoints are disabled in production" },
      { status: 403 }
    );
  }

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

