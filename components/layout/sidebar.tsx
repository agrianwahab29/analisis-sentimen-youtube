"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  History,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard/main", icon: LayoutDashboard },
  { name: "Analisis", href: "/dashboard/analysis", icon: BarChart3 },
  { name: "Top Up", href: "/dashboard/topup", icon: Wallet },
  { name: "Riwayat", href: "/dashboard/history", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 z-40 h-screen w-64 bg-[#0F172A] border-r border-[#1E293B]"
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-6 border-b border-[#1E293B]">
        <Link href="/dashboard/main" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white font-heading tracking-tight">
              VidSense
            </span>
            <span className="text-xs text-slate-400">AI</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#1E293B] text-white"
                        : "text-slate-400 hover:bg-[#1E293B] hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`
                      h-5 w-5 transition-colors duration-200
                      ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}
                    `}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebar"
                      className="absolute left-0 w-0.5 h-8 bg-blue-500 rounded-r-full"
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
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#1E293B] p-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-[#1E293B] hover:text-white"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700">
            <span className="text-xs font-semibold text-white">U</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm text-white">User</span>
            <span className="text-xs text-slate-500">user@email.com</span>
          </div>
          <LogOut className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      </div>
    </motion.aside>
  );
}
