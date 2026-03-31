"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck, Calendar, Mail, Activity, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

// Mock stats - in production, these would come from the API
const mockStats = {
  totalAnalyses: 0,
  memberSince: new Date().toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  totalCreditsUsed: 0,
  favoriteAnalysisType: "Sentiment",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const email = user?.email ?? "user@email.com";
  const displayName = email.split("@")[0];
  const initial = email.charAt(0).toUpperCase();

  const stats = [
    {
      label: "Total Analisis",
      value: mockStats.totalAnalyses.toString(),
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      label: "Kredit Digunakan",
      value: mockStats.totalCreditsUsed.toString(),
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
    {
      label: "Member Sejak",
      value: mockStats.memberSince,
      icon: Calendar,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Tipe Favorit",
      value: mockStats.favoriteAnalysisType,
      icon: BadgeCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
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
          <h1 className="text-2xl font-bold text-slate-900 font-heading">Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account information and view your activity
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
                {stats.map((stat, index) => {
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
                            {stat.value}
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
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">Display Name</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">{displayName}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">Email Address</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">{email}</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <dt className="text-sm font-medium text-slate-500">Account Type</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">Free Plan</dd>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3">
                  <dt className="text-sm font-medium text-slate-500">Member Since</dt>
                  <dd className="md:col-span-2 text-sm text-slate-900">{mockStats.memberSince}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
