import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-black text-white">Customers</h1><p className="mt-1 text-sm text-zinc-500">{customers.length} customer accounts</p></header>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-3 gap-4 bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500"><span>Name</span><span>Email</span><span>Phone</span></div>
        {customers.map((customer) => (
          <Link key={customer.id} href={`/admin/customer/${customer.id}`} className="grid grid-cols-3 gap-4 border-t border-zinc-800 px-4 py-4 text-sm hover:bg-zinc-900/60">
            <span className="font-semibold text-white">{customer.name}</span><span className="truncate">{customer.email}</span><span>{customer.phone || "—"}</span>
          </Link>
        ))}
        {customers.length === 0 && <p className="p-6 text-sm text-zinc-500">No customer accounts yet.</p>}
      </div>
    </section>
  );
}