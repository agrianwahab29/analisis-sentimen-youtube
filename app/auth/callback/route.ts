import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard/main";

  if (code) {
    // Create initial redirect response
    const response = NextResponse.redirect(new URL(next, request.nextUrl.origin));
    
    // Create supabase client with cookie handling
    const { supabase, response: updatedResponse } = createSupabaseRouteClient(request, response);
    
    // Exchange code for session - this will set cookies via setAll handler
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
          await supabase.from("users").upsert({
            id: user.id,
            email: user.email,
            credit_balance: 10,
          }, { onConflict: "id" });
        }
      }

      // Return the response with cookies set
      return updatedResponse;
    }
  }

  // Return the user to the login page if there's an error
  return NextResponse.redirect(new URL("/auth/login?error=auth_failed", request.nextUrl.origin));
}