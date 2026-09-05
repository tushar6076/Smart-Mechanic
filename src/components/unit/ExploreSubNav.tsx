"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ExploreSubNav() {
  const pathname = usePathname();

  // Route definitions for the sub-navigation tree
  const navigationLinks = [
    {
      name: "Overview Matrix",
      path: "/user/explore",
      icon: LayoutGrid,
    },
    {
      name: "Verified Workers",
      path: "/user/explore/workers",
      icon: Users,
    },
    {
      name: "Tools & Parts",
      path: "/user/explore/products",
      icon: ShieldAlert, // Swapped seamlessly out from standard stock indicators
    },
  ];

  return (
    <div className="w-full border-b border-zinc-900 bg-zinc-950/20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
          {navigationLinks.map((link) => {
            const Icon = link.icon;
            // Precise active state matching logic for App Router layout nodes
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 border whitespace-nowrap",
                  isActive
                    ? "bg-primary/5 border-primary text-white shadow-sm shadow-primary/10"
                    : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
                )}
              >
                <Icon size={12} className={cn(isActive ? "text-primary" : "text-zinc-600")} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}