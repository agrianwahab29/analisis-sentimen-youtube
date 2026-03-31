import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard/main";

  if (code) {
    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
    const supabase = createSupabaseRouteClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Create user record if it doesn't exist (for OAuth signups)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingUser) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            credit_balance: 10,
          });
        }
      }

      return response;
    }
  }

  // Return the user to the login page if there's an error
  return NextResponse.redirect(new URL("/auth/login", request.nextUrl.origin));
}
