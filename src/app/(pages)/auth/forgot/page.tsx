"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound, 
  Mail,
  CheckCircle2
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [verificationStage, setVerificationStage] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [email, setEmail] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");

  // ✉️ Layer 1: Trigger backend to check user table, cache code in Redis, and mail it
  const handleRequestVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to initiate recovery pipeline step.");
      }

      setSuccessMessage(result.message || "Security token dispatched safely.");
      setVerificationStage(2);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔑 Layer 2: Confirm token matches Redis value before pushing to reset form path
  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          code: verificationCode.trim().toUpperCase() 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Token authentication fault.");
      }

      // Forward securely with a URL query param matching your reset page requirements
      router.push(`/auth/reset?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 font-sans px-4 select-none">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />

      <div className="relative w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-950/40 bg-red-950/10 p-3 text-[11px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0 animate-pulse" /> {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-950/40 bg-emerald-950/10 p-3 text-[11px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" /> {successMessage}
          </div>
        )}

        {verificationStage === 1 && (
          <form onSubmit={handleRequestVerificationCode} className="flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">// ENGINE ACCESS RECOVERY</h2>
              <p className="text-xs text-zinc-500 mt-1">Provide your registered system identifier to initiate structural token generation.</p>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Channel Email Address</label>
              <div className="relative w-full">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors"
                  placeholder="operator@domain.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                  <Mail size={13} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Activity size={12} className="animate-spin" /> : <>Dispatched Authorization Vector <ArrowRight size={13} /></>}
            </button>
          </form>
        )}

        {verificationStage === 2 && (
          <form onSubmit={handleVerifyToken} className="flex flex-col gap-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">// LAYER 02: SYNC CHECKPOINT CHALLENGE</h2>
              <p className="text-xs text-zinc-500 mt-1">Input the alphanumeric telemetry token routed to your verification terminal address link.</p>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Security Validation Token</label>
              <div className="relative w-full">
                <input 
                  type="text"
                  required
                  maxLength={8}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono tracking-widest uppercase"
                  placeholder="X7R2B9M4"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                  <KeyRound size={13} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
              <button
                type="button"
                onClick={() => setVerificationStage(1)}
                className="px-4 py-3 border border-zinc-800 text-xs font-bold uppercase rounded-xl flex items-center gap-2 hover:bg-zinc-900/50 transition-colors"
              >
                <ArrowLeft size={13} /> Edit ID
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-black uppercase text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Activity size={12} className="animate-spin" /> : <>Verify Telemetry Match &rarr;</>}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-[11px] font-bold tracking-wide border-t border-zinc-900 pt-4">
          <span className="text-zinc-600 uppercase">Abort Process? </span>
          <Link href="/auth/login" className="text-primary hover:text-red-400 transition-colors uppercase ml-1">
            Return to Core Entry Node
          </Link>
        </div>

      </div>
    </div>
  );
}