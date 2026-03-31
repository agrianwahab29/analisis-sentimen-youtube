import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  const { supabase, response: updatedResponse } = createSupabaseRouteClient(request, response);

  await supabase.auth.signOut({ scope: "local" });

  // Return response with cleared cookies
  const jsonResponse = NextResponse.json({ ok: true });
  return jsonResponse;
}