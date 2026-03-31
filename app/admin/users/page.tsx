import { Metadata } from "next";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { UsersTable } from "@/components/admin/users-table";
import { UsersHeader } from "@/components/admin/users-header";

export const metadata: Metadata = {
  title: "Kelola Pengguna - Admin Dashboard",
  description: "Manajemen pengguna untuk platform VidSense AI",
};

export default function UsersPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <UsersHeader />
        <UsersTable />
      </div>
    </AdminDashboardLayout>
  );
}
