import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function UserOrderHistoryPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    include: { orders: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <section className="space-y-4">
      <header><h2 className="text-lg font-bold text-white">Purchase orders</h2><p className="mt-1 text-sm text-zinc-500">An order remains pending until payment is verified.</p></header>
      {payments.map((payment) => (
        <article key={payment.id} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div className="flex flex-wrap justify-between gap-2"><strong className="text-white">Order {payment.id}</strong><span className="text-xs font-bold uppercase text-amber-400">{payment.status}</span></div>
          <p className="text-xs text-zinc-500">{payment.createdAt.toLocaleString()} · Total ₹{payment.amount.toFixed(2)}</p>
          <ul className="space-y-1 text-sm">{payment.orders.map((order) => <li key={order.id}>{order.product.name} × {order.quantity} — {order.status.replaceAll("_", " ")}</li>)}</ul>
          <Link href={`/user/cart/order/payment?orderId=${encodeURIComponent(payment.id)}`} className="inline-block text-xs font-bold text-primary hover:text-red-300">View payment status</Link>
        </article>
      ))}
      {payments.length === 0 && <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-sm text-zinc-500">No orders yet.</p>}
    </section>
  );
}