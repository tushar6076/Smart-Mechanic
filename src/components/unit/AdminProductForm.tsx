"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ProductFormValue {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export default function AdminProductForm({ product }: { product?: ProductFormValue }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category || "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, price, stock, imageUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product could not be saved.");
      router.push("/admin/products");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Product could not be saved.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!product?.id || !window.confirm("Delete this product?")) return;
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Product could not be deleted.");
      router.push("/admin/products");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Product could not be deleted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <label className="block space-y-1 text-xs text-zinc-500">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
      <label className="block space-y-1 text-xs text-zinc-500">Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 text-xs text-zinc-500">Category<input required value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
        <label className="block space-y-1 text-xs text-zinc-500">Price (INR)<input required type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
        <label className="block space-y-1 text-xs text-zinc-500">Stock<input required type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
        <label className="block space-y-1 text-xs text-zinc-500">Image URL<input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Saving…" : "Save product"}</button>
        {product?.id && <button type="button" disabled={loading} onClick={remove} className="rounded-lg border border-red-900 px-4 py-2 text-sm font-bold text-red-400 disabled:opacity-50">Delete product</button>}
      </div>
    </form>
  );
}
