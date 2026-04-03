import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeCreditBalance } from "@/lib/normalize-credit-balance";

export async function GET() {
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
            // Server Component — cannot set cookies
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let creditBalance = 0;
  let profileMissing = false;
  if (user) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: profile, error } = await adminClient
        .from("users")
        .select("credit_balance")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("session profile fetch error:", error);
      }

      profileMissing = !profile;
      creditBalance = normalizeCreditBalance(profile?.credit_balance);
    } else {
      const { data: profile } = await supabase
        .from("users")
        .select("credit_balance")
        .eq("id", user.id)
        .maybeSingle();
      profileMissing = !profile;
      creditBalance = normalizeCreditBalance(profile?.credit_balance);
    }
  }

  const payload: Record<string, unknown> = {
    user: user ? { ...user, credit_balance: creditBalance } : null,
  };

  if (process.env.NODE_ENV !== "production" && user) {
    payload.profile_missing = profileMissing;
  }

  return NextResponse.json(payload);
}
