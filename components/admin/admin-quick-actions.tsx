"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FolderTree, FileText, Users, Plus } from "lucide-react";

const actions = [
  {
    name: "Tambah Kategori",
    description: "Buat kategori baru untuk konten",
    icon: FolderTree,
    href: "/admin/categories",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
  },
  {
    name: "Tambah Postingan",
    description: "Buat postingan baru",
    icon: FileText,
    href: "/admin/posts",
    color: "bg-violet-500",
    hoverColor: "hover:bg-violet-600",
  },
  {
    name: "Tambah Pengguna",
    description: "Daftarkan pengguna baru",
    icon: Users,
    href: "/admin/users",
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
  },
];

export function AdminQuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-900 font-heading">
          Aksi Cepat
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Pintasan untuk tindakan umum
        </p>
      </div>

      <div className="p-4 space-y-2">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-slate-50"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color} ${action.hoverColor} transition-colors`}
            >
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                {action.name}
              </p>
              <p className="text-xs text-slate-500">{action.description}</p>
            </div>
            <Plus className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
