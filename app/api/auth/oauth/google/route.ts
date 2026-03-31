import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;

  // Create initial response
  const response = NextResponse.next();
  const { supabase } = createSupabaseRouteClient(request, response);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    return NextResponse.json(
      { error: "Gagal memulai login Google." },
      { status: 400 }
    );
  }

  // Return JSON with OAuth URL for client-side redirect
  const jsonResponse = NextResponse.json({ url: data.url });
  return jsonResponse;
}