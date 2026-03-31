import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect ke login page sebagai entry point
  redirect("/auth/login");
}
