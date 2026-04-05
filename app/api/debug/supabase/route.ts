import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

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

  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    tests: {},
  };

  try {
    // Test 1: Session client
    const { supabase: sessionClient } = await createSupabaseRouteHandlerClient();
    const { data: { user }, error: sessionError } = await sessionClient.auth.getUser();
    
    results.tests.sessionAuth = {
      success: !sessionError && !!user,
      userId: user?.id || null,
      userEmail: user?.email || null,
      error: sessionError?.message || null,
    };

    // Test 2: Service role client (if available)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Test query
      const { data: tables, error: tablesError } = await serviceClient
        .from("transactions")
        .select("count", { count: "exact", head: true });

      results.tests.serviceRole = {
        success: !tablesError,
        error: tablesError?.message || null,
        code: tablesError?.code || null,
      };
    } else {
      results.tests.serviceRole = {
        success: false,
        error: "SUPABASE_SERVICE_ROLE_KEY not set",
      };
    }

    return NextResponse.json(results);
  } catch (error) {
    results.error = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(results, { status: 500 });
  }
}