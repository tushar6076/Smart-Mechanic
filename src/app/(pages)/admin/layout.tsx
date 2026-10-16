import React from "react";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/unit/AdminNavbar";
import { getSessionUser } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "ADMIN") redirect("/user");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <AdminNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}