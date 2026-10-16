import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { appointments: true, payments: true, reviews: true } } },
  });
  if (!customer || customer.role !== "CUSTOMER") notFound();
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/customer" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white">← Customers</Link>
      <header><p className="text-xs font-bold uppercase tracking-wider text-red-400">Customer account</p><h1 className="mt-2 text-2xl font-black text-white">{customer.name}</h1></header>
      <dl className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:grid-cols-2">
        <div><dt className="text-xs uppercase text-zinc-500">Email</dt><dd className="mt-1">{customer.email}</dd></div>
        <div><dt className="text-xs uppercase text-zinc-500">Phone</dt><dd className="mt-1">{customer.phone || "Not provided"}</dd></div>
        <div><dt className="text-xs uppercase text-zinc-500">Address</dt><dd className="mt-1">{customer.address || "Not provided"}</dd></div>
        <div><dt className="text-xs uppercase text-zinc-500">Joined</dt><dd className="mt-1">{customer.createdAt.toLocaleDateString()}</dd></div>
        <div><dt className="text-xs uppercase text-zinc-500">Appointments</dt><dd className="mt-1">{customer._count.appointments}</dd></div>
        <div><dt className="text-xs uppercase text-zinc-500">Payments</dt><dd className="mt-1">{customer._count.payments}</dd></div>
      </dl>
    </section>
  );
}