import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminProductForm from "@/components/unit/AdminProductForm";

export default async function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/products" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white">← Products</Link>
      <header><h1 className="text-2xl font-black text-white">Edit product</h1></header>
      <AdminProductForm product={product} />
    </section>
  );
}