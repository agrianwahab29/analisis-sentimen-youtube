import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const fullName = typeof body?.fullName === "string" ? body.fullName : "";

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: "Nama, email, dan password wajib diisi." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter." },
      { status: 400 }
    );
  }

  const { supabase, responseHeaders } = await createSupabaseRouteHandlerClient();
  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) {
    console.error("Supabase signUp error:", signUpError);
    const response = NextResponse.json(
      { error: signUpError.message || "Gagal mendaftar. Email mungkin sudah terdaftar." },
      { status: 400 }
    );
    responseHeaders.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (data.user) {
    // Use upsert to handle orphan records gracefully
    const { error: upsertError } = await supabase.from("users").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        credit_balance: 10,
      },
      {
        onConflict: "id",
        ignoreDuplicates: false,
      }
    );

    if (upsertError) {
      console.error("Profile upsert error:", upsertError);
      const response = NextResponse.json(
        { error: "Pendaftaran berhasil, tapi gagal membuat profil pengguna." },
        { status: 500 }
      );
      responseHeaders.forEach((value, key) => response.headers.set(key, value));
      return response;
    }
  }

  const emailConfirmationRequired = !data.session;
  const response = NextResponse.json({ ok: true, emailConfirmationRequired });
  responseHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}
