import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const { supabase } = await createSupabaseRouteHandlerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?type=recovery`,
    });

    if (error) {
      console.error("Supabase reset password error:", error);
      return NextResponse.json(
        { error: "Gagal mengirim email reset. Silakan coba lagi." },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      ok: true, 
      message: "Email reset password berhasil dikirim" 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
