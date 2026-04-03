import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Check if accessing admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isProtectedRoute = isAdminRoute || isDashboardRoute;

  // If not protected route and not logged in, allow access
  if (!isProtectedRoute) {
    return response;
  }

  // Protected routes require login
  if (error || !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin access for admin routes
  if (isAdminRoute) {
    const { data: userData } = await supabase
      .from("users")
      .select("role,email")
      .eq("id", user.id)
      .single();

    const isAdmin =
      userData?.role === "admin" || user.email === "agrianwahab10@gmail.com";

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard/main", request.url));
    }
  }

  // Check if user is suspended for dashboard routes
  if (isDashboardRoute) {
    const { data: userData } = await supabase
      .from("users")
      .select("is_suspended")
      .eq("id", user.id)
      .single();

    if (userData?.is_suspended) {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }
  }

  // Allow access
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
