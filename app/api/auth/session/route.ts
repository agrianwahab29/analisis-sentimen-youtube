import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
