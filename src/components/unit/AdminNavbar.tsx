"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  ShieldAlert, 
  Package, 
  Users, 
  UserCheck, 
  CalendarRange, 
  Settings, 
  LogOut,
  LayoutDashboard
} from "lucide-react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  // 🗂️ Core operational routes in the center
  const adminLinks = [
    { name: "Home", href: "/admin", exact: true, icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", exact: false, icon: Package },
    { name: "Workers", href: "/admin/worker", exact: false, icon: UserCheck },
    { name: "Customers", href: "/admin/customer", exact: false, icon: Users },
    { name: "Applications", href: "/admin/application", exact: false, icon: CalendarRange },
  ];

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-red-900/40 bg-zinc-950 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        
        {/* LEFT: ADMIN CONTROL BRANDING */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="rounded-lg bg-red-950 border border-red-700/50 p-1.5 text-red-500">
              <ShieldAlert size={16} className="animate-pulse" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-zinc-100">
              HQ // <span className="text-red-500">CORE</span>
            </span>
          </Link>
        </div>

        {/* CENTER: OPERATIONAL CHANNELS */}
        <div className="hidden lg:flex items-center gap-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-150 border",
                  isActive
                    ? "bg-red-950/30 border-red-900/60 text-red-400"
                    : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                )}
              >
                <Icon size={13} className={isActive ? "text-red-400" : "text-zinc-500"} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* RIGHT: SYSTEM SETTINGS & SESSION DESTRUCTION */}
        <div className="flex items-center gap-2">
          
          {/* Settings Trigger Icon */}
          <Link
            href="/admin/settings"
            className={cn(
              "p-2 rounded-lg border transition-all duration-150",
              pathname.startsWith("/admin/settings")
                ? "bg-red-950/30 border-red-900/60 text-red-400"
                : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
            )}
            title="System Settings"
          >
            <Settings size={14} className={pathname.startsWith("/admin/settings") ? "animate-spin-slow" : ""} />
          </Link>

          <div className="h-4 w-px bg-zinc-800" />

          {/* Logout Action Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-red-400 hover:border-red-950/60 hover:bg-red-950/20 transition-all duration-200 text-[11px] font-bold uppercase tracking-widest"
            title="Terminate Admin Session"
          >
            <span className="hidden sm:inline">Exit Node</span>
            <LogOut size={14} />
          </button>
        </div>

      </div>
    </nav>
  );
}