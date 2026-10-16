"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Tag, Filter, Activity, Check } from "lucide-react";

interface ProductCatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrls: string[];
}

function ExploreProductsCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";

  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/public/explore/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }

      } catch (err) {
        console.error("Failed loading inventory models:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    setCartError(null);
    try {
      const res = await fetch("/api/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        setAddedProductId(productId);
        setTimeout(() => setAddedProductId(null), 2000);
      } else {
        const data = await res.json();
        setCartError(res.status === 401 ? "Sign in to add products to your cart." : data.error || "Could not add this product.");
      }
    } catch (err) {
      console.error("Cart insertion transaction failure:", err);
      setCartError("Could not reach the cart service. Please try again.");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || p.category.toUpperCase() === categoryFilter.toUpperCase();
    return matchesSearch && matchesCat;
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-400 font-sans pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {cartError && <p role="alert" className="rounded-lg border border-red-900/60 bg-red-950/20 p-3 text-sm text-red-300">{cartError} {cartError.startsWith("Sign in") && <Link href="/auth/login" className="underline">Login</Link>}</p>}
        
        {/* FILTERS HUB */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/40">
          <div className="relative md:col-span-2">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product identifiers..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 pl-9 text-xs text-zinc-200 focus:outline-none"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          </div>
          <div className="relative">
            <select
              title="Filter by Product Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 pl-9 text-xs text-zinc-200 focus:outline-none appearance-none font-bold uppercase tracking-wider"
            >
              <option value="ALL">All Hardware Components</option>
              <option value="DIAGNOSTICS">Diagnostics</option>
              <option value="PRESSURE">Pressure Gauges</option>
              <option value="TOOLING">Heavy Tooling</option>
              <option value="ELECTRICAL">Electrical Hardware</option>
            </select>
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>
        </div>

        {/* PRODUCTS GRID MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-4 flex flex-col justify-between hover:border-zinc-800 transition-colors group">
              <div>
                <div className="w-full aspect-square bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-700 uppercase font-mono text-label tracking-widest relative overflow-hidden">
                  {product.imageUrls?.[0] ? (
                    <img src={product.imageUrls[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  ) : "No Image Trace"}
                  <div className="absolute top-2 left-2 bg-zinc-950/80 border border-zinc-800 px-1.5 py-0.5 rounded text-[8px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Tag size={9} /> {product.category}
                  </div>
                </div>

                <Link href={`/user/explore/products/${product.id}`} className="mt-4 block truncate text-xs font-black uppercase tracking-wide text-zinc-200 hover:text-primary">{product.name}</Link>
                <p className="text-control text-zinc-600 line-clamp-2 mt-1 leading-normal">{product.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900/60 flex items-center justify-between">
                <span className="text-xs font-black text-white">₹{product.price.toFixed(2)}</span>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                  className="bg-primary hover:bg-red-600 disabled:bg-zinc-900 disabled:text-zinc-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                >
                  {addedProductId === product.id ? <Check size={13} /> : <ShoppingCart size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function ExploreProductsCatalog() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center bg-zinc-950 text-zinc-500">Loading products…</div>}>
      <ExploreProductsCatalogContent />
    </Suspense>
  );
}