import React from "react";
import UserNavbar from "@/components/unit/UserNavbar";
import Footer from "@/components/unit/Footer";

interface UserLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  title: "Smart Mechanic // System Dashboard",
  description: "Production garage orchestration portal and industrial tool inventory network.",
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950 text-zinc-400 font-sans antialiased">
      
      {/* 🛰️ GLOBAL APPLICATION NAVIGATION CORE */}
      <UserNavbar />

      {/* ⚡ DYNAMIC ROUTE CELL INJECTION INTERFACE */}
      {/* min-h-[calc(100vh-theme(spacing.16))] ensures the footer behaves correctly on empty lists */}
      <div className="flex-1 min-h-[calc(100vh-4rem)]">
        {children}
      </div>

      {/* 📝 THE BASE DISCLOSURE LEVEL FRAME */}
      <Footer />
      
    </div>
  );
}