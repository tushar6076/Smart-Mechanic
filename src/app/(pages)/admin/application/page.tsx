import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminApplicationsPage() {
  const applications = await prisma.worker.findMany({
    where: { status: { in: ["PENDING_VERIFICATION", "INTERVIEW_SCHEDULED"] } },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-black text-white">Worker applications</h1><p className="mt-1 text-sm text-zinc-500">Review applications and manage interview decisions.</p></header>
      <div className="space-y-3">
        {applications.map((application) => (
          <Link key={application.id} href={`/admin/application/${application.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:border-red-900">
            <div><strong className="text-white">{application.user.name}</strong><p className="mt-1 text-sm text-zinc-500">{application.user.email}</p></div>
            <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs">{application.status.replaceAll("_", " ")}</span>
          </Link>
        ))}
        {applications.length === 0 && <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-sm text-zinc-500">No applications need review.</p>}
      </div>
    </section>
  );
}