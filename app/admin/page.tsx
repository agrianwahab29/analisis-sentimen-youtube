import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { RecentActivity } from "@/components/admin/recent-activity";
import { Users, FileText, Clock, DollarSign } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              Dashboard Admin
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola pengguna dan verifikasi pembayaran
            </p>
          </div>
        </div>

        {/* Statistics */}
        <AdminStats />

        {/* Quick Actions */}
        <AdminQuickActions />

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </AdminDashboardLayout>
  );
}
