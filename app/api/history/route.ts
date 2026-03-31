import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    responseHeaders.forEach((v, k) => res.headers.set(k, v));
    return res;
  }

  const { data: history, error } = await supabase
    .from("analysis_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const res = NextResponse.json({ history: history ?? [] });
  responseHeaders.forEach((v, k) => res.headers.set(k, v));
  return res;
}
