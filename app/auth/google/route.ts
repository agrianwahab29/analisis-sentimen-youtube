import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;

  // Use the route handler client with async cookies
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    const response = NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url)
    );
    responseHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  // Return redirect with Set-Cookie headers for code_verifier
  const response = NextResponse.redirect(data.url);
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}