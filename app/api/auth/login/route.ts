import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const response = NextResponse.json(
      { error: "Email atau password tidak valid." },
      { status: 401 }
    );
    responseHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  const response = NextResponse.json({ ok: true });
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}
