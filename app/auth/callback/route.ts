import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = request.nextUrl.searchParams.get("next") ?? "/dashboard/main";
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", origin));
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component — cannot set cookies, ignore
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", origin));
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        throw new Error("Missing Supabase service credentials");
      }

      // Use service role to avoid RLS insert/select issues during first login.
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: existingUser, error: existingUserError } = await adminClient
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existingUserError) {
        throw existingUserError;
      }

      const payload = existingUser
        ? { id: user.id, email: user.email }
        : { id: user.id, email: user.email, credit_balance: 75 };

      const { error: upsertError } = await adminClient
        .from("users")
        .upsert(payload, { onConflict: "id" });

      if (upsertError) {
        throw upsertError;
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
