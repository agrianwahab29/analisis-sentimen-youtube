import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  // Create Supabase client
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Not logged in - redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is admin (agrianwahab10@gmail.com)
  if (user.email !== "agrianwahab10@gmail.com") {
    // Not admin - redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // User is admin - allow access
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
