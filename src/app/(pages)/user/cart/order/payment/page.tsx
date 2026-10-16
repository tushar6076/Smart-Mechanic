"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  ArrowRight, 
  FileText, 
  RefreshCw,
  AlertTriangle,
  Activity 
} from "lucide-react";

function StatusTerminalCore() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [resolvedStatus, setResolvedStatus] = useState<"loading" | "pending" | "success" | "failed" | "error">("loading");
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState(orderId || "");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<"PLACED" | "OUT_OF_STOCK" | null>(null);
  const orderStatus = !orderId ? "error" : loadedOrderId === orderId ? resolvedStatus : "loading";

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    fetch(`/api/user/orders/${encodeURIComponent(orderId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Order could not be found.");
        if (!active) return;
        setReferenceId(data.order.id);
        setFulfillmentStatus(
          data.order.orders?.some((item: { status: string }) => item.status === "CANCELLED")
            ? "OUT_OF_STOCK"
            : "PLACED",
        );
        setLoadedOrderId(orderId);
        setResolvedStatus(data.order.status === "SUCCESS" ? "success" : data.order.status === "FAILED" ? "failed" : "pending");
      })
      .catch(() => {
        if (active) setResolvedStatus("error");
      });
    return () => { active = false; };
  }, [orderId]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-zinc-950 text-zinc-400 font-sans px-4 select-none">
      {/* Background Ambience Fabric Matrix */}
      <div className="app-grid-overlay absolute inset-0 opacity-20" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90 text-center flex flex-col items-center gap-6">
        
        {/* ========================================== */}
        {/* 🟢 SUCCESS STATE LAYOUT BLOCK               */}
        {/* ========================================== */}
        {orderStatus === "success" ? (
          <>
            <div className="rounded-full bg-emerald-950/30 border border-emerald-900 text-emerald-400 p-4 shrink-0">
              <CheckCircle2 size={32} />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-black uppercase tracking-tighter text-white italic">
                TRANSACTION COMMITTED // VERIFIED
              </h1>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-medium">
                {fulfillmentStatus === "OUT_OF_STOCK"
                  ? "The test payment signature was verified, but inventory changed before fulfillment. The order was cancelled; no real money was collected."
                  : "Razorpay verified this test-mode payment and the order has been recorded. No real money was collected."}
              </p>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left font-mono text-control flex flex-col gap-1.5 relative overflow-hidden">
              <Terminal size={14} className="absolute right-3 top-3 text-zinc-700" />
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase">SYSTEM_STATE:</span>
                <span className="text-emerald-500 font-bold">
                  {fulfillmentStatus === "OUT_OF_STOCK" ? "TEST_PAYMENT_VERIFIED_ORDER_CANCELLED" : "TEST_PAYMENT_VERIFIED"}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-800/60 pt-1.5 mt-0.5">
                <span className="text-zinc-600 uppercase">TRACKING_REF:</span>
                <span className="text-zinc-300 uppercase tracking-wide font-black">{referenceId}</span>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
              <Link 
                href="/user/profile/orders"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700 font-bold uppercase text-label tracking-widest py-3 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText size={12} /> Inspect Invoice
              </Link>
              <Link 
                href="/user"
                className="flex-1 rounded-xl bg-primary hover:bg-red-600 text-white font-black uppercase text-label tracking-widest py-3 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/10"
              >
                Workspace Central <ArrowRight size={12} />
              </Link>
            </div>
          </>
        ) : (
          /* ========================================== */
          /* 🔴 FAILURE STATE LAYOUT BLOCK               */
          /* ========================================== */
          <>
            <div className="rounded-full bg-amber-950/30 border border-amber-900 text-amber-400 p-4 shrink-0">
              {orderStatus === "loading" ? <Activity size={32} className="animate-spin" /> : orderStatus === "failed" ? <XCircle size={32} /> : <AlertTriangle size={32} />}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-black uppercase tracking-tighter text-white italic">
                {orderStatus === "failed" ? "PAYMENT FAILED" : orderStatus === "loading" ? "CHECKING ORDER STATUS" : "PAYMENT NOT CONFIRMED"}
              </h1>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-medium">
                {orderStatus === "pending"
                  ? "Payment is not confirmed yet. This test order remains pending and can be retried; no real charge can occur."
                  : orderStatus === "failed"
                    ? "Payment was not verified. No real payment was taken."
                    : orderStatus === "loading"
                      ? "Checking the order status with the server."
                      : "The order could not be found or loaded. No payment has been taken."}
              </p>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left font-mono text-control flex flex-col gap-1.5 relative overflow-hidden">
              <AlertTriangle size={14} className="absolute right-3 top-3 text-red-900" />
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase">FAULT_CODE:</span>
                <span className="text-amber-400 font-bold">{orderStatus.toUpperCase()}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800/60 pt-1.5 mt-0.5">
                <span className="text-zinc-600 uppercase">PAYMENT_MODE:</span>
                <span className="text-zinc-400 font-medium">Razorpay test mode only</span>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
              <Link 
                href="/user/cart/order"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700 font-bold uppercase text-label tracking-widest py-3 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} /> Back to cart
              </Link>
              <Link 
                href="/user"
                className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-black uppercase text-label tracking-widest py-3 flex items-center justify-center gap-1.5 transition-all"
              >
                Exit Terminal
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ⏳ Wrap in a standard Suspense container to satisfy build rules matching dynamic useSearchParams hooks
export default function CheckoutPaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    }>
      <StatusTerminalCore />
    </Suspense>
  );
}