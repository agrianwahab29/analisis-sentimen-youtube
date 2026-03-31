import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const origin = new URL(request.url).origin;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    const response = NextResponse.json(
      { error: "Gagal memulai login Google." },
      { status: 400 }
    );
    responseHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  const response = NextResponse.json({ url: data.url });
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}
