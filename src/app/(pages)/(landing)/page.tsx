"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Activity } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // ⏱️ STRICT TIMEOUT: Fires absolute redirection after 3 seconds have elapsed
    const redirectTimer = setTimeout(() => {
      router.push("/home");
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-zinc-950 text-zinc-400 font-sans selection:bg-primary selection:text-white flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl px-4 text-center flex flex-col items-center gap-6 animate-pulse">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-semibold backdrop-blur-md text-zinc-300 shadow-xl shadow-black/40">
          <Terminal size={12} className="text-primary" />
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">BOOTSEQUENCE_INIT</span>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
        </div>

        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white sm:text-6xl md:text-7xl leading-none">
          THE DIGITAL GARAGE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
            ECOSYSTEM Engine
          </span>
        </h1>

        <p className="max-w-2xl text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-600 leading-relaxed">
          Compiling modular dependencies ... establishing core socket pipes
        </p>

        <div className="flex items-center gap-3 mt-4">
          <Activity size={14} className="animate-spin text-primary" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500">Synchronizing Matrix Clusters</span>
        </div>
      </div>
    </div>
  );
}