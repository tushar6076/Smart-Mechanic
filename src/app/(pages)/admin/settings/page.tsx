import { getSessionUser } from "@/lib/session";

export default async function AdminSettingsPage() {
  const admin = await getSessionUser();
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header><p className="text-xs font-bold uppercase tracking-widest text-red-400">System configuration</p><h1 className="mt-2 text-2xl font-black text-white">Admin settings</h1></header>
      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <p className="text-sm text-zinc-500">Signed-in administrator</p>
        <p className="font-semibold text-white">{admin?.name}</p>
        <p>{admin?.email}</p>
        <p className="text-xs text-zinc-500">Sensitive SMTP, database, and payment credentials remain server-side in environment configuration.</p>
      </div>
    </section>
  );
}