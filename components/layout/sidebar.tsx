"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  History,
  LogOut,
  Sparkles,
  User,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

const bottomNavItems: SidebarItem[] = [
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onToggle?: () => void;
  isOpen?: boolean;
  isMobile?: boolean;
}

function SidebarContent({ onToggle }: { onToggle?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const email = user?.email ?? "user@email.com";
  const initial = email.charAt(0).toUpperCase();
  const displayName = email.split("@")[0];

  return (
    <>
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-[#1E293B]">
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
        {/* Close button for mobile */}
        {onToggle && (
          <button
            onClick={onToggle}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onToggle}
                      className={`
                        group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-[#1E293B] text-white"
                            : "text-slate-400 hover:bg-[#1E293B] hover:text-white"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          h-5 w-5 shrink-0 transition-colors duration-200
                          ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}
                        `}
                      />
                      <span className="truncate max-w-[160px]">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebar"
                          className="absolute left-0 w-0.5 h-8 bg-blue-500 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={16}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation (Profile & Settings) */}
      <div className="px-3 pb-4">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={onToggle}
                      className={`
                        group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-[#1E293B] text-white"
                            : "text-slate-400 hover:bg-[#1E293B] hover:text-white"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          h-5 w-5 shrink-0 transition-colors duration-200
                          ${isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"}
                        `}
                      />
                      <span className="truncate max-w-[160px]">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId={`activeSidebar-${item.name}`}
                          className="absolute left-0 w-0.5 h-8 bg-blue-500 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={16}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User Section - Compact with better overflow handling */}
      <div className="border-t border-[#1E293B] p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                signOut();
                onToggle?.();
              }}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-[#1E293B] hover:text-white"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700">
                <span className="text-xs font-semibold text-white">{initial}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="w-full truncate text-sm font-medium text-white">
                  {displayName}
                </span>
                <span className="w-full truncate text-xs text-slate-500">
                  {email}
                </span>
              </div>
              <LogOut className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={16}>
            <div className="flex flex-col gap-1">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-slate-300">{email}</span>
              <span className="text-xs text-slate-400">Click to sign out</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </>
  );
}

// Desktop sidebar - always visible on md+ screens
function DesktopSidebar() {
  return (
    <TooltipProvider>
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-64 bg-[#0F172A] border-r border-[#1E293B] flex-col"
      >
        <SidebarContent />
      </motion.aside>
    </TooltipProvider>
  );
}

// Mobile drawer - slides in from left
function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 md:hidden"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-screen w-72 bg-[#0F172A] border-r border-[#1E293B] flex-col md:hidden"
          >
            <SidebarContent onToggle={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Sidebar({ isMobile, isOpen, onToggle }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    const newState = !mobileOpen;
    setMobileOpen(newState);
    onToggle?.();
  };

  const handleClose = () => {
    setMobileOpen(false);
    onToggle?.();
  };

  // If controlled from parent (isMobile prop provided)
  if (isMobile !== undefined && isOpen !== undefined) {
    return (
      <>
        <DesktopSidebar />
        <MobileDrawer isOpen={isOpen} onClose={onToggle || (() => {})} />
      </>
    );
  }

  // Default behavior - self-managed mobile state
  return (
    <>
      <DesktopSidebar />
      <MobileDrawer isOpen={mobileOpen} onClose={handleClose} />
    </>
  );
}

// Export the toggle button separately for use in header
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
