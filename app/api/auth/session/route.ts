import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  const { supabase } = createSupabaseRouteClient(request, response);

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

  return NextResponse.json({
    user: user ? { ...user, credit_balance: creditBalance } : null,
  });
}