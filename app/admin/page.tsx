import { Metadata } from "next";
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { RecentActivity } from "@/components/admin/recent-activity";

export const metadata: Metadata = {
  title: "Admin Dashboard - VidSense AI",
  description: "Dashboard administrasi untuk mengelola platform VidSense AI",
};

export default function AdminPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-white font-heading">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-slate-400 max-w-xl">
              Kelola kategori, postingan, dan pengguna platform VidSense AI dari satu tempat yang terpusat.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <AdminStats />

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div>
            <AdminQuickActions />
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
