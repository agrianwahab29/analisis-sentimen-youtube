"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Pengguna", href: "/admin/users", icon: Users },
  { name: "Verifikasi Pembayaran", href: "/admin/transactions", icon: CreditCard },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const email = user?.email ?? "admin@email.com";
  const initial = email.charAt(0).toUpperCase();
  const displayName = email.split("@")[0];

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950 border-r border-slate-800"
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white font-heading tracking-tight">
              Admin
            </span>
            <span className="text-xs text-violet-400">Panel</span>
          </div>
        </Link>
      </div>

      {/* Back to Main Dashboard */}
      <div className="px-3 py-4 border-b border-slate-800">
        <Link
          href="/dashboard/main"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative
                    ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-5 w-5 transition-colors duration-200
                      ${isActive ? "text-violet-400" : "text-slate-400 group-hover:text-white"}
                    `}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeAdminSidebar"
                      className="absolute left-0 w-0.5 h-8 bg-violet-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-slate-900 hover:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-700">
            <span className="text-xs font-semibold text-white">{initial}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm text-white">{displayName}</span>
            <span className="text-xs text-slate-500">{email}</span>
          </div>
          <LogOut className="ml-auto h-4 w-4" />
        </button>
      </div>
    </motion.aside>
  );
}
