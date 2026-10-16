import React from "react";
import { redirect } from "next/navigation";
import UserProfileSideNav from "@/components/unit/UserProfileSideNav";
import { getSessionUser } from "@/lib/session";

export default async function UserProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Account</p>
        <h1 className="mt-1 text-2xl font-black text-white">Profile center</h1>
      </div>
      <div className="flex flex-col gap-6 md:flex-row">
        <UserProfileSideNav />
        <section className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">{children}</section>
      </div>
    </main>
  );
}