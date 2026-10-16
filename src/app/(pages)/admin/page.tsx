import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [customers, workers, pendingApplications, products, appointments] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.worker.count(),
    prisma.worker.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.product.count(),
    prisma.appointment.count(),
  ]);
  const metrics = [
    ["Customers", customers, "/admin/customer"],
    ["Workers", workers, "/admin/worker"],
    ["Applications to review", pendingApplications, "/admin/application"],
    ["Products", products, "/admin/products"],
    ["Appointments", appointments, "/admin/application"],
  ] as const;

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-widest text-red-400">Operations overview</p>
        <h1 className="mt-2 text-3xl font-black text-white">Admin dashboard</h1>
        <p className="mt-2 text-sm text-zinc-500">Live counts from the current service database.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([label, count, href]) => (
          <Link key={label} href={href} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-red-900">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{label}</span>
            <strong className="mt-3 block text-3xl text-white">{count}</strong>
            <span className="mt-3 block text-xs text-red-400">Open list →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}