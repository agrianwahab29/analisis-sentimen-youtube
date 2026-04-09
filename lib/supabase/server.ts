import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware client - handles token refresh and session updates
 * CRITICAL: Must update request cookies and recreate response for proper session handling
 */
export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update request cookies first
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Recreate response with updated request headers
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        // Set cookies on the new response
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Route client for API routes and callbacks
 * Handles read/write cookies with proper response handling
 */
export function createSupabaseRouteClient(
  request: NextRequest,
  response: NextResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let currentResponse = response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update request cookies
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        // Recreate response with updated cookies
        currentResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        // Set cookies on response
        cookiesToSet.forEach(({ name, value, options }) => {
          currentResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response: currentResponse };
}

/**
 * Server components and route handlers that use async cookies()
 * For use with await cookies() pattern in Server Components
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // In Server Components, cookies can only be read, not set
          // This is expected behavior - use route handlers for setting cookies
        }
      },
    },
  });
}

/**
 * Legacy function - kept for backward compatibility
 * Prefer using createSupabaseRouteClient for proper cookie handling
 */
export async function createSupabaseRouteHandlerClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const responseHeaders = new Headers();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Fallback to headers if cookieStore.set fails
          cookiesToSet.forEach(({ name, value }) => {
            responseHeaders.append("Set-Cookie", `${name}=${value}`);
          });
        }
      },
    },
  });

  return { supabase, responseHeaders };
}

/**
 * Service Role Client for admin operations
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 * Use with caution - has full database access
 */
export function createSupabaseServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // Service role client doesn't need cookie handling
      },
    },
  });
}