// Login API endpoint - disabled
// Authentication is handled via Google OAuth and Supabase Auth
export async function POST() {
  return Response.json(
    { error: "Please use Google OAuth or login page" },
    { status: 400 }
  );
}
