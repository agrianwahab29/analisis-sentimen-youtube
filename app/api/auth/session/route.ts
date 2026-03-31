import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const response = NextResponse.json({ user: user ?? null });
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}
