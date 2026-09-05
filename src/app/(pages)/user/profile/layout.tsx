import React from "react";
import UserProfileSideNav from "@/components/unit/UserProfileSideNav";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row">
        
        {/* Left Hand Sidebar Frame */}
        <UserProfileSideNav />
        
        {/* Right Hand Dynamic Sub-View Workspace */}
        <main className="flex-1 min-w-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          {children}
        </main>
        
      </div>
    </div>
  );
}