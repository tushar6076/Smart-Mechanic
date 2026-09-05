"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Activity,
  ShoppingBag,
  CreditCard
} from "lucide-react";

interface CartLineItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    imageUrls: string[];
  };
}

export default function UserCartManifestPage() {
  const router = useRouter();

  // 📊 Core Logistics State Vectors
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Sync active cart lines directly from current database context
  useEffect(() => {
    async function pullStagedManifest() {
      try {
        const res = await fetch("/api/user/cart");
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } catch (err) {
        console.error("Cart system query breakdown:", err);
      } finally {
        setIsLoading(false);
      }
    }
    pullStagedManifest();
  }, []);

  // ⚙️ Mutation Engine: Change line quantity tracking limits
  const handleModifyQuantity = async (itemId: string, newQty: number, maxStock: number) => {
    if (newQty < 1 || newQty > maxStock) return;
    setIsUpdatingId(itemId);

    try {
      const res = await fetch("/api/user/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQty }),
      });

      if (res.ok) {
        setCartItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQty } : item
        ));
      }
    } catch (err) {
      console.error("Failed adjusting system stock allocation weights:", err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // 🗑️ Mutation Engine: Hard-evict row from user relational cart table
  const handleEvictItem = async (itemId: string) => {
    setIsUpdatingId(itemId);
    try {
      const res = await fetch(`/api/user/cart/delete?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error("Failed cascading database row delete sequence:", err);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // 🧮 Running Telemetry Totals Calculations
  const subtotalValue = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const estimatedTax = subtotalValue * 0.18; // 18% standard logistics service rate matching local calculations
  const completeInvoiceTotal = subtotalValue + estimatedTax;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Recalculating Manifest Totals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* MODULE HEADER BAR */}
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
            <ShoppingCart size={14} /> // PIPELINE ALLOCATION MATRIX
          </div>
          <h1 className="text-xl font-black text-white uppercase mt-1 tracking-tight">STAGED PROCUREMENT MANIFEST</h1>
          <p className="text-xs text-zinc-500 mt-1">Audit active inventory selections and lock parameters prior to launching currency clearance routines.</p>
        </div>

        {/* EMPTY STATE BANNER FALLBACK */}
        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-900 p-16 text-center flex flex-col items-center justify-center gap-4 bg-zinc-950/20">
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-zinc-600">
              <ShoppingBag size={24} />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wide">Procurement Buffer Empty</h3>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">No industrial components or calibrated tools are currently allocated to your user row cache context.</p>
            </div>
            <Link 
              href="/user/explore/products" 
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white border border-primary/20 bg-primary/5 px-4 py-2 rounded-xl mt-2 transition-all"
            >
              Query Stock System Index
            </Link>
          </div>
        ) : (
          /* BALANCED LAYOUT CONTENT SPLIT GRID */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* MANIFEST LIST ARRAY COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="rounded-xl border border-zinc-900 bg-zinc-950/50 p-4 flex items-center justify-between gap-4 hover:border-zinc-800 transition-colors"
                >
                  {/* IMAGE & SPECIFICS CONTAINER */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-14 rounded-lg border border-zinc-800 bg-zinc-900 flex items-center justify-center font-mono text-[9px] text-zinc-700 shrink-0 overflow-hidden">
                      {item.product.imageUrls?.[0] ? (
                        <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : "TOOL_IMG"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-black uppercase text-zinc-200 tracking-wide truncate">{item.product.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">UNIT: ₹{item.product.price.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* ACTION AND ARITHMETIC MODIFIERS GROUP */}
                  <div className="flex items-center gap-6 shrink-0">
                    {/* QUANTITY MATRIX CLAMP ELEMENT */}
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
                      <button
                        title="Decrease quantity"
                        onClick={() => handleModifyQuantity(item.id, item.quantity - 1, item.product.stock)}
                        disabled={item.quantity <= 1 || isUpdatingId === item.id}
                        className="p-1 hover:text-white text-zinc-600 disabled:text-zinc-800 transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-xs font-mono font-black text-zinc-300 w-6 text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        title="Increase quantity"
                        onClick={() => handleModifyQuantity(item.id, item.quantity + 1, item.product.stock)}
                        disabled={item.quantity >= item.product.stock || isUpdatingId === item.id}
                        className="p-1 hover:text-white text-zinc-600 disabled:text-zinc-800 transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    {/* ROW INVOICE SCALE */}
                    <div className="flex flex-col items-end w-24">
                      <span className="text-[11px] font-mono font-black text-white">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* EVICTION TRIGGER */}
                    <button
                      title="Remove item from cart"
                      onClick={() => handleEvictItem(item.id)}
                      disabled={isUpdatingId === item.id}
                      className="text-zinc-600 hover:text-primary transition-colors disabled:text-zinc-800"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {/* INVOICE TERMINAL SUMMARY BLOCK */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-2">
                <CreditCard size={13} className="text-primary" /> CLEARANCE VALUATION
              </h3>

              <div className="flex flex-col gap-2 font-mono text-xs border-b border-zinc-900/60 pb-4">
                <div className="flex justify-between">
                  <span className="text-zinc-600 uppercase">SUBTOTAL LOAD:</span>
                  <span className="text-zinc-400">₹{subtotalValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 uppercase">LOGISTICS TAX (18%):</span>
                  <span className="text-zinc-400">₹estimatedTax.toFixed(2)</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AGGREGATE DEBIT</span>
                <span className="text-base font-mono font-black text-white">₹{completeInvoiceTotal.toFixed(2)}</span>
              </div>

              {/* ROUTE PUSH FOR CLEARANCE TRIGGER */}
              <button
                onClick={() => router.push("/user/cart/payment")}
                className="w-full rounded-xl bg-primary hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest py-3 mt-2 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
              >
                Launch Checkout Sequence <ArrowRight size={13} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}