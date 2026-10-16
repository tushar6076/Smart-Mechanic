import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminWorkerActions from "@/components/unit/AdminWorkerActions";

export default async function AdminWorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: { user: true, services: { select: { name: true } } },
  });
  if (!worker) notFound();
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/worker" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white">← Mechanics</Link>
      <header><p className="text-xs font-bold uppercase tracking-widest text-red-400">Worker profile</p><h1 className="mt-2 text-2xl font-black text-white">{worker.user.name}</h1></header>
      <div className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:grid-cols-2">
        <p><span className="text-zinc-500">Email:</span> {worker.user.email}</p>
        <p><span className="text-zinc-500">Phone:</span> {worker.user.phone || "Not provided"}</p>
        <p><span className="text-zinc-500">Status:</span> {worker.status.replaceAll("_", " ")}</p>
        <p><span className="text-zinc-500">Experience:</span> {worker.experience} years</p>
        <p><span className="text-zinc-500">Proof:</span> {worker.idProofType || "Not provided"} — {worker.idProofNumber || "Not provided"}</p>
        <p><span className="text-zinc-500">Services:</span> {worker.services.map((service) => service.name).join(", ") || worker.customSkills || "None listed"}</p>
        {worker.idProofUrl && <a className="text-red-400 underline" href={worker.idProofUrl} target="_blank" rel="noreferrer">View identity proof</a>}
      </div>
      <AdminWorkerActions workerId={worker.id} currentStatus={worker.status} adminNotes={worker.adminNotes || ""} meetingLink={worker.meetingLink || ""} />
    </section>
  );
}