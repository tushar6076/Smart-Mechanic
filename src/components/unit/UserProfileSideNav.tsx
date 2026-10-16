"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  User, 
  Settings, 
  Package, 
  Heart, 
  ChevronRight 
} from "lucide-react";

export default function UserProfileSideNav() {
  const pathname = usePathname();

  // 🗂️ Exact structural path alignments for the /user/profile directory
  const menuItems = [
    {
      name: "Overview",
      href: "/user/profile",
      exact: true, // Highlights only when exactly on /user/profile
      icon: User,
    },
    {
      name: "Account Settings",
      href: "/user/profile/account",
      exact: false,
      icon: Settings,
    },
    {
      name: "Purchase Orders",
      href: "/user/profile/orders",
      exact: false,
      icon: Package,
    },
    {
      name: "Saved Wishlist",
      href: "/user/profile/wishlist",
      exact: false,
      icon: Heart,
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      {/* HEADER LABEL */}
      <div className="px-3 mb-4">
        <h2 className="text-label font-black uppercase tracking-widest text-zinc-500">
          Account Control
        </h2>
      </div>

      {/* NAVIGATION SELECTIONS */}
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // Strict active matching logic to avoid partial matches on the core overview page
          const isActive = item.exact 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 border",
                isActive
                  ? "bg-zinc-900 border-zinc-800 text-primary"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon 
                  size={16} 
                  className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"
                  )} 
                />
                <span>{item.name}</span>
              </div>
              
              <ChevronRight 
                size={14} 
                className={cn(
                  "opacity-0 -translate-x-1 transition-all duration-200",
                  isActive ? "opacity-100 translate-x-0 text-primary" : "group-hover:opacity-100 group-hover:translate-x-0 text-zinc-600"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}