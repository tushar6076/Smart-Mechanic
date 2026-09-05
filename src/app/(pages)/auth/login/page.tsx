"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Eye, EyeOff, Activity, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // Input fields states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Status feedback mechanics
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 🛰️ Hit your backend authentication routing handler
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid database authentication parameters.");
      }

      // Drop session identifier flags to notify your root gateway bypass check
      localStorage.setItem("sm_session_state", "true");

      // Route based on verified database role enum
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/user");
      }

    } catch (err: any) {
      setErrorMessage(err.message || "System error connecting to auth server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-400 font-sans px-4 select-none">
      {/* Background Matrix Fabrics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
      
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/80">
        
        {/* Brand identity anchor */}
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <div className="rounded-xl bg-primary p-2.5 text-white w-fit shadow-md shadow-primary/20">
            <Wrench size={18} className="rotate-45" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter text-white italic">
            SMART<span className="text-primary">MECHANIC</span> // SECURE AUTH
          </h1>
          <p className="text-xs text-zinc-500">Access your integrated field service and tools command workspace.</p>
        </div>

        {/* Error notification node */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-950/40 bg-red-950/10 p-3 text-[11px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck size={14} className="shrink-0 animate-pulse" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          {/* Email block */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Vector Identifier</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-medium"
              placeholder="operator@domain.com"
            />
          </div>

          {/* Password block */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Secure Cryptographic Token</label>
            <div className="relative w-full">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submission Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-primary-dark transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Activity size={12} className="animate-spin" /> Verifying Credentials...
              </>
            ) : "Authenticate Account"}
          </button>
        </form>

        {/* Alternate registration link mapping */}
        <div className="mt-6 text-center text-[11px] font-bold tracking-wide border-t border-zinc-900 pt-4">
          <span className="text-zinc-600 uppercase">Unregistered Identifier Node? </span>
          <Link href="/auth/signup" className="text-primary hover:text-red-400 transition-colors uppercase ml-1">
            Initialize Core Registration &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}