"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, Calendar, Mail, Activity, Zap, Coins, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { normalizeCreditBalance } from "@/lib/normalize-credit-balance";
import { motion } from "framer-motion";

interface UserStats {
  totalAnalyses: number;
  totalCreditsUsed: number;
  memberSince: string;
  creditBalance: number;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalAnalyses: 0,
    totalCreditsUsed: 0,
    memberSince: "-",
    creditBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  const email = user?.email ?? "user@email.com";
  const displayName = email.split("@")[0];
  const initial = email.charAt(0).toUpperCase();
  const creditBalance = normalizeCreditBalance(
    user ? (user as Record<string, unknown>).credit_balance : undefined
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch analysis history
        const historyRes = await fetch("/api/history");
        if (historyRes.ok) {
          const { history } = await historyRes.json();
          
          // Calculate total analyses
          const totalAnalyses = history?.length ?? 0;
          
          // Calculate credits used (sum of all analysis credits)
          const totalCreditsUsed = history?.reduce((sum: number, h: { credits_used: number }) => sum + (h.credits_used || 0), 0) ?? 0;
          
          // Get earliest analysis date or use current date
          let memberSince = new Date().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          
          if (history && history.length > 0) {
            const earliestDate = history.reduce((earliest: string, h: { created_at: string }) => 
              h.created_at < earliest ? h.created_at : earliest, history[0].created_at);
            memberSince = new Date(earliestDate).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }

          setStats({
            totalAnalyses,
            totalCreditsUsed,
            memberSince,
            creditBalance,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [creditBalance]);

  const statsData = [
    {
      label: "Total Analisis",
      value: stats.totalAnalyses.toString(),
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Kredit Tersisa",
      value: new Intl.NumberFormat("id-ID").format(stats.creditBalance),
      icon: Coins,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      label: "Kredit Digunakan",
      value: stats.totalCreditsUsed.toString(),
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      label: "Member Sejak",
      value: stats.memberSince,
      icon: Calendar,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Profil</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola informasi akun dan lihat aktivitas Anda
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <Avatar className="h-24 w-24 ring-4 ring-slate-100">
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                    {initial}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {displayName}
                      </h2>
                      <BadgeCheck className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-slate-500">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Stats Grid */}
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      className="group rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-500 truncate">
                            {stat.label}
                          </p>
                          <p className="text-lg font-semibold text-slate-900 truncate">
                            {loading ? "..." : stat.value}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-slate-500" />
                Informasi Akun
              </CardTitle>
              <CardDescription>
                Detail akun dan preferensi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">Nama Tampilan</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">{displayName}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">Email</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">{email}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">Tipe Akun</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Gratis
                    </span>
                  </dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
                  <dt className="text-sm font-medium text-slate-500">Member Sejak</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">
                    {loading ? "..." : stats.memberSince}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}