import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminWorkersPage() {
  const workers = await prisma.worker.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-black text-white">Mechanics</h1><p className="mt-1 text-sm text-zinc-500">{workers.length} worker profiles</p></header>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-4 gap-4 bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500"><span>Name</span><span>Email</span><span>Status</span><span>Experience</span></div>
        {workers.map((worker) => (
          <Link key={worker.id} href={`/admin/worker/${worker.id}`} className="grid grid-cols-4 gap-4 border-t border-zinc-800 px-4 py-4 text-sm hover:bg-zinc-900/60">
            <span className="font-semibold text-white">{worker.user.name}</span><span className="truncate">{worker.user.email}</span><span>{worker.status.replaceAll("_", " ")}</span><span>{worker.experience} years</span>
          </Link>
        ))}
        {workers.length === 0 && <p className="p-6 text-sm text-zinc-500">No worker profiles yet.</p>}
      </div>
    </section>
  );
}