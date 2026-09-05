"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  Activity, 
  ArrowRight,
  AlertTriangle 
} from "lucide-react";

interface CheckoutItem {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

export default function OrderStagingReviewPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // Sync active order contents instantly on validation loop launch
  useEffect(() => {
    async function pullStagedOrderContext() {
      try {
        const res = await fetch("/api/user/cart");
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
          if (data.defaultAddress) setShippingAddress(data.defaultAddress);
        }
      } catch (err) {
        console.error("Order context staging error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    pullStagedOrderContext();
  }, []);

  const subtotalValue = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const estimatedTax = subtotalValue * 0.18; // 18% standard mechanics tax rate
  const globalInvoiceTotal = subtotalValue + estimatedTax;

  const handleCommitOrderSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setErrorLog("Specify a valid destination delivery address point.");
      return;
    }

    setIsSubmitting(true);
    setErrorLog(null);

    try {
      const response = await fetch("/api/user/orders/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          address: shippingAddress.trim(),
          amount: globalInvoiceTotal 
        }),
      });

      const result = await response.json();

      if (response.ok && result.orderId) {
        // Safe directional route transfer directly to payment engine module tracking room
        router.push(`/user/cart/payment?orderId=${result.orderId}`);
      } else {
        setErrorLog(result.error || "Failed staging database infrastructure order lines.");
      }
    } catch (err) {
      console.error("Order allocation sequence drop:", err);
      setErrorLog("System communication timeout exception logged.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Verifying Fleet Stocks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        <Link href="/user/cart" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors w-fit">
          <ArrowLeft size={12} /> Modify Manifest Items
        </Link>

        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
            <Truck size={14} /> // LOGISTICS ROUTING ROOM
          </div>
          <h1 className="text-xl font-black text-white uppercase mt-1 tracking-tight">STAGED ORDER AUDIT OVERVIEW</h1>
          <p className="text-xs text-zinc-500 mt-1">Configure logistics coordinates and review structural totals before launching secure gateway authorization links.</p>
        </div>

        {errorLog && (
          <div className="rounded-xl border border-red-950/40 bg-red-950/10 p-3 text-[11px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0 text-primary animate-pulse" /> {errorLog}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LOGISTICS ADDRESS FORMS FORM BLOCK */}
          <form onSubmit={handleCommitOrderSequence} className="lg:col-span-2 flex flex-col gap-5">
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 sm:p-6 flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-2">
                <MapPin size={13} className="text-primary" /> DELIVERY COORDINATES TARGET
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Destination Delivery Address Address</label>
                <textarea
                  required
                  rows={4}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Provide precise destination house coordinates or regional engineering warehouse address sector details..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* AUDIT SUMMARY CHECKLIST BLOCK */}
            <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 sm:p-6 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-1">
                <ShoppingBag size={13} className="text-primary" /> ALLOCATION ITEMS MANIFEST AUDIT
              </h3>
              
              <div className="flex flex-col gap-2 font-mono text-[11px]">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-zinc-900/40 last:border-0">
                    <span className="text-zinc-400 uppercase truncate max-w-md">{item.product.name} <strong className="text-zinc-600 font-black">x{item.quantity}</strong></span>
                    <span className="text-zinc-300 font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* INVOICE TOTAL BALANCE SUMMARY BOX */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <ShieldCheck size={13} className="text-primary" /> INVOICE STATEMENT
            </h3>

            <div className="flex flex-col gap-2 font-mono text-xs border-b border-zinc-900/60 pb-4">
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase">SUBTOTAL ITEMS:</span>
                <span className="text-zinc-400">₹{subtotalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase">LOGISTICS TAX (18%):</span>
                <span className="text-zinc-400">₹{estimatedTax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AGGREGATE INVOICE</span>
              <span className="text-base font-mono font-black text-white">₹{globalInvoiceTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCommitOrderSequence}
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full rounded-xl bg-primary hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest py-3.5 mt-2 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
            >
              {isSubmitting ? (
                <>Staging Order Parameters... <Activity size={12} className="animate-spin" /></>
              ) : (
                <>Lock Order & Proceed <ArrowRight size={13} /></>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}