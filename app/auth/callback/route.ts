import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard/main";
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", origin));
  }

  // Use route handler client with async cookies
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();

  // Exchange code for session - this sets the session cookies
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", origin));
  }

  // Get the user and create user record if needed
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          credit_balance: 75,
        });
      }
    } catch (err) {
      console.error("Error creating user:", err);
      // Continue anyway - user is authenticated
    }
  }

  // Return redirect with session cookies set
  const response = NextResponse.redirect(new URL(next, origin));
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}