"use client";

import { motion } from "framer-motion";
import { FolderTree, FileText, Users, UserPlus, Edit3, Trash2 } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "category",
    action: "created",
    title: "Kategori baru ditambahkan",
    description: "Teknologi AI",
    user: "Admin",
    time: "5 menit lalu",
    icon: FolderTree,
    color: "bg-blue-500",
  },
  {
    id: 2,
    type: "post",
    action: "created",
    title: "Postingan baru dipublikasikan",
    description: "Panduan Analisis Sentimen",
    user: "Admin",
    time: "1 jam lalu",
    icon: FileText,
    color: "bg-violet-500",
  },
  {
    id: 3,
    type: "user",
    action: "registered",
    title: "Pengguna baru terdaftar",
    description: "john.doe@email.com",
    user: "Sistem",
    time: "3 jam lalu",
    icon: UserPlus,
    color: "bg-emerald-500",
  },
  {
    id: 4,
    type: "category",
    action: "updated",
    title: "Kategori diperbarui",
    description: "Tutorial YouTube",
    user: "Admin",
    time: "5 jam lalu",
    icon: Edit3,
    color: "bg-amber-500",
  },
  {
    id: 5,
    type: "post",
    action: "deleted",
    title: "Postingan dihapus",
    description: "Draft Lama",
    user: "Admin",
    time: "1 hari lalu",
    icon: Trash2,
    color: "bg-rose-500",
  },
];

export function RecentActivity() {
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
              <p className="text-xs text-slate-500">oleh {activity.user}</p>
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
