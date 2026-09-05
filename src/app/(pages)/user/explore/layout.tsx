import React from "react";
import ExploreSubNav from "@/components/unit/ExploreSubNav";

interface ExploreLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Smart Mechanic // Explore Workspace",
  description: "Query and isolate localized field service engineers and industrial logistics equipment.",
};

export default function ExploreLayout({ children }: ExploreLayoutProps) {
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-4rem)] bg-zinc-950">
      
      {/* 📡 SHARED EXPLORATION SUB-NAVIGATION PIPELINE */}
      <ExploreSubNav />

      {/* ⚡ ACTIVE DIRECTORY NESTED CELL CELL VIEW */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      
    </div>
  );
}