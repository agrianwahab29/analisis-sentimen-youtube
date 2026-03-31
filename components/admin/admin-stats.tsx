"use client";

import { motion } from "framer-motion";
import { FolderTree, FileText, Users, TrendingUp } from "lucide-react";

const stats = [
  {
    name: "Total Kategori",
    value: "12",
    change: "+2",
    changeType: "positive" as const,
    icon: FolderTree,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    name: "Total Postingan",
    value: "48",
    change: "+8",
    changeType: "positive" as const,
    icon: FileText,
    color: "from-violet-500 to-violet-600",
    bgColor: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    name: "Total Pengguna",
    value: "156",
    change: "+12",
    changeType: "positive" as const,
    icon: Users,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    name: "Pertumbuhan",
    value: "24%",
    change: "+4%",
    changeType: "positive" as const,
    icon: TrendingUp,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

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
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.name}
          variants={itemVariants}
          className="group relative overflow-hidden rounded-xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
        >
          {/* Background gradient on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900 font-heading">
                {stat.value}
              </p>
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "positive" ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-slate-500"> bulan ini</span>
              </div>
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
