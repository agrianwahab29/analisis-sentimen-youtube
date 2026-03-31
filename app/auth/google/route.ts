import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;

  // Create initial response
  const response = NextResponse.next();
  const { supabase, response: updatedResponse } = createSupabaseRouteClient(request, response);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data?.url) {
    const errorResponse = NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url)
    );
    return errorResponse;
  }

  return NextResponse.redirect(data.url);
}