
import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/login?error=auth_failed", process.env.NEXT_PUBLIC_SITE_URL)
    );
  }

  if (data.url) {
    const response = NextResponse.redirect(data.url);
    responseHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  return NextResponse.redirect(
    new URL("/auth/login?error=auth_failed", process.env.NEXT_PUBLIC_SITE_URL)
  );
}
