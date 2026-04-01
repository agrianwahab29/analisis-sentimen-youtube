"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, UserX, DollarSign, TrendingUp } from "lucide-react";

interface AdminStatsData {
  total_users: number;
  pending_approval: number;
  suspended_users: number;
  active_users: number;
  total_revenue: number;
  revenue_this_month: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch stats:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl bg-white border border-slate-200 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Pengguna",
      value: stats?.total_users || 0,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      name: "Menunggu Approval",
      value: stats?.pending_approval || 0,
      icon: UserCheck,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      name: "User Aktif",
      value: stats?.active_users || 0,
      icon: UserCheck,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      name: "Ditangguhkan",
      value: stats?.suspended_users || 0,
      icon: UserX,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      name: "Pendapatan Total",
      value: `Rp ${(stats?.total_revenue || 0).toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      name: "Pendapatan Bulan Ini",
      value: `Rp ${(stats?.revenue_this_month || 0).toLocaleString("id-ID")}`,
      icon: TrendingUp,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {statCards.map((stat) => (
        <motion.div
          key={stat.name}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 font-heading">
                {stat.value}
              </p>
            </div>
            <div className={`${stat.bgColor} rounded-xl p-3`}>
              <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
