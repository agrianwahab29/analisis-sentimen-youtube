// Register API endpoint - disabled
// Registration is handled via Google OAuth
export async function POST() {
  return Response.json(
    { error: "Please use Google OAuth for registration" },
    { status: 400 }
  );
}
