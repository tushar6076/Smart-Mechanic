"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  Heart,
  Warehouse, 
  Activity 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrls: string[];
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailDynamicPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { id } = use(params);

  // 📊 Local Core Tracking States
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSavingWishlist, setIsSavingWishlist] = useState<boolean>(false);

  useEffect(() => {
    async function loadProductTelemetry() {
      try {
        const res = await fetch(`/api/public/explore/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
        } else {
          router.push("/user/explore/products");
        }
      } catch (err) {
        console.error("Inventory item pull tracking execution failure:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProductTelemetry();
  }, [id, router]);

  const triggerCartMutation = async () => {
    if (!product || product.stock === 0) return;
    setIsAdding(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        const data = await res.json();
        setErrorMessage(res.status === 401 ? "Sign in to add products to your cart." : data.error || "Could not add this product.");
      }
    } catch (err) {
      console.error("Cart cache write error:", err);
      setErrorMessage("Could not reach the cart service. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const saveToWishlist = async () => {
    if (!product) return;
    setIsSavingWishlist(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Sign in to save products to your wishlist." : data.error || "Could not save this product.");
      setErrorMessage("Saved to your wishlist.");
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "Could not save this product.");
    } finally {
      setIsSavingWishlist(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-6">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* BACK TO BROWSE VECTOR LINK */}
        <Link 
          href="/user/explore/products" 
          className="flex items-center gap-2 text-label font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={12} /> Back to Tooling Pipeline
        </Link>

        {/* DETAILS CORE GRID ARCHITECTURE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* IMAGE PORT HUB */}
          <div className="aspect-square w-full rounded-2xl border border-zinc-900 bg-zinc-950/40 overflow-hidden flex items-center justify-center font-mono text-control text-zinc-700 tracking-widest relative">
            {product.imageUrls?.[0] ? (
              <img 
                src={product.imageUrls[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : "No Visual Node Logged"}
          </div>

          {/* BLOCK SPECS FRAME */}
          <div className="flex flex-col gap-6">
            {errorMessage && <p role="status" className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-300">{errorMessage} {errorMessage.startsWith("Sign in") && <Link href="/auth/login" className="ml-1 underline text-primary">Login</Link>}</p>}
            <div>
              <span className="text-micro font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white mt-3 tracking-tight">
                {product.name}
              </h1>
              <p className="text-label font-mono text-zinc-600 mt-1 uppercase tracking-wider">
                NODE_ID: ${product.id}
              </p>
            </div>

            <div className="border-t border-b border-zinc-900 py-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-micro font-black uppercase tracking-widest text-zinc-600">Procurement Value</span>
                <span className="text-xl font-black text-white mt-0.5">₹{product.price.toFixed(2)}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-micro font-black uppercase tracking-widest text-zinc-600">Cluster Availability</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Warehouse size={12} className={product.stock > 0 ? "text-emerald-500" : "text-red-500"} />
                  <span className={cn("text-xs font-bold uppercase tracking-wide", product.stock > 0 ? "text-emerald-500" : "text-red-500")}>
                    {product.stock > 0 ? `${product.stock} Units In Stock` : "Depleted"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-label font-black uppercase tracking-widest text-zinc-500">PRODUCT DESCRIPTION</span>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* MUTATION EXECUTION TARGET BOX */}
            <button
              onClick={triggerCartMutation}
              disabled={product.stock === 0 || isAdding}
              className={cn(
                "w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2",
                product.stock === 0 
                  ? "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                  : isSuccess 
                  ? "bg-emerald-600 text-white"
                  : "bg-primary hover:bg-red-600 shadow-md shadow-primary/10"
              )}
            >
              {isAdding ? (
                <>Updating Allocation Manifest... <Activity size={12} className="animate-spin" /></>
              ) : isSuccess ? (
                <>Item Staged In Manifest <Check size={13} /></>
              ) : product.stock === 0 ? (
                "Procurement Pipeline Depleted"
              ) : (
                <>Commit To Cart Manifest <ShoppingCart size={13} /></>
              )}
            </button>
            <button type="button" onClick={saveToWishlist} disabled={isSavingWishlist} className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 hover:border-primary hover:text-white disabled:opacity-50">
              <Heart size={13} /> {isSavingWishlist ? "Saving…" : "Save to wishlist"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}