import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminProductForm from "@/components/unit/AdminProductForm";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <section className="space-y-8">
      <header><h1 className="text-2xl font-black text-white">Product inventory</h1><p className="mt-1 text-sm text-zinc-500">Create and manage the public catalog.</p></header>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-4 gap-4 bg-zinc-900 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-500"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span></div>
        {products.map((product) => (
          <Link key={product.id} href={`/admin/products/${product.id}`} className="grid grid-cols-4 gap-4 border-t border-zinc-800 px-4 py-4 text-sm hover:bg-zinc-900/60">
            <span className="truncate font-semibold text-white">{product.name}</span><span>{product.category}</span><span>₹{product.price.toFixed(2)}</span><span>{product.stock}</span>
          </Link>
        ))}
        {products.length === 0 && <p className="p-5 text-sm text-zinc-500">No products yet.</p>}
      </div>
      <div className="max-w-3xl space-y-4">
        <h2 className="text-lg font-bold text-white">Add product</h2>
        <AdminProductForm />
      </div>
    </section>
  );
}