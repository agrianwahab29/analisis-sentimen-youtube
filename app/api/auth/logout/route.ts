import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST() {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  
  await supabase.auth.signOut({ scope: "local" });

  const response = NextResponse.json({ ok: true });
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}