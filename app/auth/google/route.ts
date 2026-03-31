import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

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

  return NextResponse.redirect(data.url);
}
