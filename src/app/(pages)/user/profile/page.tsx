import Link from "next/link";
import { getSessionUser } from "@/lib/session";

export default async function UserProfilePage() {
  const user = await getSessionUser();
  return (
    <section className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <h2 className="text-lg font-bold text-white">Account overview</h2>
      <p className="text-sm text-zinc-400">Signed in as <strong className="text-white">{user?.name}</strong> ({user?.email}).</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/user/profile/account" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Edit account</Link>
        <Link href="/user/profile/orders" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold text-zinc-200">View orders</Link>
      </div>
    </section>
  );
}