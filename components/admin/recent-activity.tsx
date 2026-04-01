"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, UserX, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

interface Activity {
  id: string;
  type: "user" | "transaction";
  action: "approve" | "suspend" | "add_credits" | "approve_payment" | "reject_payment";
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setActivities(data.activities || []);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch activity:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
        <p className="text-center text-slate-500">Memuat aktivitas...</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 font-heading mb-4">
          Aktivitas Terbaru
        </h2>
        <p className="text-center text-slate-500 py-8">
          Belum ada aktivitas admin
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 font-heading">
          Aktivitas Terbaru
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Log aktivitas admin 24 jam terakhir
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activity.color}`}>
              <activity.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {activity.title}
              </p>
              <p className="text-sm text-slate-500 truncate">
                {activity.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-400">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
        <button className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
          Lihat semua aktivitas →
        </button>
      </div>
    </motion.div>
  );
}
