// Google OAuth callback - handled by Supabase Auth
export async function GET() {
  return Response.json(
    { error: "OAuth handled via /auth/google" },
    { status: 400 }
  );
}
