"use client";

import React, { Suspense } from "react";
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
  
  // 📡 Extract transactional parameters passed from the gateway router push
  const status = searchParams.get("status") || "success"; // 'success' | 'failed'
  const referenceId = searchParams.get("ref") || "SYS-NOD-EMPTY";

  const isSuccess = status === "success";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center bg-zinc-950 text-zinc-400 font-sans px-4 select-none">
      {/* Background Ambience Fabric Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90 text-center flex flex-col items-center gap-6">
        
        {/* ========================================== */}
        {/* 🟢 SUCCESS STATE LAYOUT BLOCK               */}
        {/* ========================================== */}
        {isSuccess ? (
          <>
            <div className="rounded-full bg-emerald-950/30 border border-emerald-900 text-emerald-400 p-4 shrink-0">
              <CheckCircle2 size={32} />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-black uppercase tracking-tighter text-white italic">
                TRANSACTION COMMITTED // VERIFIED
              </h1>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-medium">
                Your currency clearance pass has been validated by internal consensus nodes. Procurement metrics have successfully logged into the core tracking ledger rows.
              </p>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left font-mono text-[11px] flex flex-col gap-1.5 relative overflow-hidden">
              <Terminal size={14} className="absolute right-3 top-3 text-zinc-700" />
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase">SYSTEM_STATE:</span>
                <span className="text-emerald-500 font-bold">EXECUTION_SUCCESS</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800/60 pt-1.5 mt-0.5">
                <span className="text-zinc-600 uppercase">TRACKING_REF:</span>
                <span className="text-zinc-300 uppercase tracking-wide font-black">{referenceId}</span>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
              <Link 
                href="/user/profile/orders"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700 font-bold uppercase text-[10px] tracking-widest py-3 flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText size={12} /> Inspect Invoice
              </Link>
              <Link 
                href="/user"
                className="flex-1 rounded-xl bg-primary hover:bg-red-600 text-white font-black uppercase text-[10px] tracking-widest py-3 flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary/10"
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
            <div className="rounded-full bg-red-950/30 border border-red-900 text-red-500 p-4 shrink-0 animate-pulse">
              <XCircle size={32} />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-lg font-black uppercase tracking-tighter text-white italic">
                TRANSACTION EXCEPTION // ABORTED
              </h1>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-medium">
                The gateway connection failed to verify authorization token structures. No funds were drained from your banking channels.
              </p>
            </div>

            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-left font-mono text-[11px] flex flex-col gap-1.5 relative overflow-hidden">
              <AlertTriangle size={14} className="absolute right-3 top-3 text-red-900" />
              <div className="flex justify-between">
                <span className="text-zinc-600 uppercase">FAULT_CODE:</span>
                <span className="text-red-500 font-bold">ERR_SYS_ABORT</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800/60 pt-1.5 mt-0.5">
                <span className="text-zinc-600 uppercase">METRIC_LOG:</span>
                <span className="text-zinc-400 font-medium">Bypassed or rejected configuration.</span>
              </div>
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-3 mt-2">
              <Link 
                href="/user/cart/payment"
                className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700 font-bold uppercase text-[10px] tracking-widest py-3 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} /> Retry Route
              </Link>
              <Link 
                href="/user"
                className="flex-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-black uppercase text-[10px] tracking-widest py-3 flex items-center justify-center gap-1.5 transition-all"
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