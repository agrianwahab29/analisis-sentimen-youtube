import { redirect } from "next/navigation";

// Register page is disabled - users must sign up via Google OAuth
export default function RegisterPage() {
  redirect("/auth/login");
}
