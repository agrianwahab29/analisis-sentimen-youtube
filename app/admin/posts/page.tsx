import { Metadata } from "next";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { PostsTable } from "@/components/admin/posts-table";
import { PostsHeader } from "@/components/admin/posts-header";

export const metadata: Metadata = {
  title: "Kelola Postingan - Admin Dashboard",
  description: "Manajemen postingan untuk konten VidSense AI",
};

export default function PostsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <PostsHeader />
        <PostsTable />
      </div>
    </AdminDashboardLayout>
  );
}
