import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function GET() {
  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let creditBalance = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("credit_balance")
      .eq("id", user.id)
      .single();
    creditBalance = profile?.credit_balance ?? 0;
  }

  const response = NextResponse.json({
    user: user ? { ...user, credit_balance: creditBalance } : null,
  });
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}
