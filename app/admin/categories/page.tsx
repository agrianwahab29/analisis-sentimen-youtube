import { Metadata } from "next";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { CategoriesTable } from "@/components/admin/categories-table";
import { CategoriesHeader } from "@/components/admin/categories-header";

export const metadata: Metadata = {
  title: "Kelola Kategori - Admin Dashboard",
  description: "Manajemen kategori untuk konten VidSense AI",
};

export default function CategoriesPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <CategoriesHeader />
        <CategoriesTable />
      </div>
    </AdminDashboardLayout>
  );
}
