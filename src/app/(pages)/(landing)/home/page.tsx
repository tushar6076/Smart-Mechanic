"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Wrench, Cpu, ArrowRight, Terminal, Activity, Layers, Package } from "lucide-react";

export default function PlatformOverviewLandingPage() {
  const router = useRouter();

  // 🔒 Guest Mode Initialization: Bypasses intro loops for subsequent refreshes
  const handleGuestEntrySelection = (targetPath: string) => {
    localStorage.setItem("sm_returning_guest", "true");
    sessionStorage.setItem("sm_session_active", "true");
    router.push(targetPath);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 overflow-hidden bg-zinc-950 selection:bg-primary selection:text-white">
      <div className="app-brand-glow absolute inset-0 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

      <div className="w-full max-w-4xl flex flex-col gap-10 relative z-10">
        
        {/* PLATFORM BRANDING CONTAINER */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/80 p-3 text-primary shadow-lg shadow-primary/5">
            <Cpu size={28} />
          </div>
          <div>
            <span className="text-label font-mono font-black tracking-[0.3em] text-primary uppercase block">// HYPER-LOGISTICS INTELLIGENCE MATRIX</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1.5">SMART MECHANIC OS</h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto mt-2 leading-relaxed">
              Automated vehicle telemetry tracking, persistent hardware components procurement, and multi-role tactical dispatch control systems.
            </p>
          </div>
        </div>

        {/* FUNCTIONAL DECKS MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* TRACK 1: AUTHENTICATION ENTRANCE */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/30 p-6 flex flex-col justify-between gap-6 hover:border-zinc-800/80 transition-all group">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-primary">
                <Wrench size={16} />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">// SECURE ACCOUNT DISPATCH</span>
              </div>
              <h2 className="text-base font-black text-zinc-200 uppercase tracking-tight group-hover:text-white transition-colors">DIAGNOSTICS & FIELD ENGINE</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Stage real-time operational tickets, lock coordinate destination addresses, and map asymmetric tracking manifests between verified clients and technicians.
              </p>
            </div>
            <button 
              onClick={() => router.push("/auth/login")}
              className="flex items-center justify-between w-full rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 px-4 py-3 text-label font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-all text-left"
            >
              Authenticate & Login <ArrowRight size={13} className="text-primary group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* TRACK 2: BROWSE IN GUEST MODE */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/30 p-6 flex flex-col justify-between gap-6 hover:border-zinc-800/80 transition-all group">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-primary">
                <Package size={16} />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">// SUPPLY CHAIN MATRIX</span>
              </div>
              <h2 className="text-base font-black text-zinc-200 uppercase tracking-tight group-hover:text-white transition-colors">PROCUREMENT SYSTEM INDEX</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Query hardware inventory indices, audit live component stock quotas, allocate parts to order lines, and browse workspace parameters instantly.
              </p>
            </div>
            {/* 🟢 FIXED: Points cleanly back to the application base home route workspace */}
            <button 
              onClick={() => handleGuestEntrySelection("/user")}
              className="flex items-center justify-between w-full rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 px-4 py-3 text-label font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-all text-left"
            >
              Browse As Guest Agent <ArrowRight size={13} className="text-primary group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* TELEMETRY CONTROL FEED */}
        <div className="rounded-xl border border-zinc-900/60 bg-zinc-950/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-label tracking-wider text-zinc-600 uppercase">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-emerald-500" />
            <span>NODE PIPELINE INJECTORS: <strong className="text-zinc-400 font-bold">ONLINE</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} />
            <span>CORE ROUTER BOUNDARY: <strong className="text-zinc-400 font-bold">DYNAMIC</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Layers size={12} />
            <span>DB SCHEMAS STATUS: <strong className="text-zinc-400 font-bold">COMPILED</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}