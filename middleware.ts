import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/server";

const protectedRoutes = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Create response with forwarded request headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create server-side Supabase client for session validation
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Validate session server-side using getUser()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Return response with updated cookies from Supabase client
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
