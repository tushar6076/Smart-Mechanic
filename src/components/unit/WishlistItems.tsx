"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WishlistItem {
  id: string;
  productId: string;
  product: { id: string; name: string; category: string; price: number };
}

export default function WishlistItems() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/wishlist")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Wishlist could not be loaded.");
        setItems(data.items);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Wishlist could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/user/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Wishlist item could not be removed.");
      setItems((current) => current.filter((item) => item.productId !== productId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wishlist item could not be removed.");
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading wishlist…</p>;
  if (error && items.length === 0) return <p role="alert" className="text-sm text-red-400">{error}</p>;
  return (
    <div className="space-y-3">
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {items.map(({ product }) => (
        <div key={product.id} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
          <div><Link href={`/user/explore/products/${product.id}`} className="font-semibold text-white hover:text-primary">{product.name}</Link><p className="mt-1 text-xs text-zinc-500">{product.category} · ₹{product.price.toFixed(2)}</p></div>
          <button type="button" onClick={() => remove(product.id)} className="text-xs font-bold text-red-400 hover:text-red-300">Remove</button>
        </div>
      ))}
      {items.length === 0 && <p className="rounded-xl border border-dashed border-zinc-800 p-8 text-sm text-zinc-500">Your wishlist is empty.</p>}
    </div>
  );
}
