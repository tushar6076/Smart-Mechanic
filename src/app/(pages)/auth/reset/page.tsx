"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { cn } from "@/lib/utils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🛰️ Extracted verification context parameters
  const email = searchParams.get("email");
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<boolean>(false);

  // 📝 Mutation fields
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // 🔐 Commit new database identity key mutation
  const handlePasswordMutationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("Process aborted. Security verification tracking context is null.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Cryptographic parameters mismatch. Passwords do not align.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Your password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Database execution failed to commit new password parameter.");
      }

      setSuccessMessage("Cipher state mutated successfully. Redirecting to login portal...");
      
      // Deliberate hold to let user digest success confirmation before shift
      setTimeout(() => {
        router.push("/auth/login");
      }, 2500);

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to update the password.");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 font-sans px-4 select-none">
      {/* 🌌 Ambient Engine Grid Matrix Backplane */}
      <div className="app-grid-overlay absolute inset-0 opacity-20" />

      {/* 🧱 RESET TRANSACTION TERMINAL FRAME */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl shadow-black/90">
        
        {/* 🚨 Error Telemetry Message Hub */}
        {(errorMessage || !email) && (
          <div className="mb-6 rounded-xl border border-red-950/40 bg-red-950/10 p-3 text-control font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0 animate-pulse" /> {errorMessage || "Missing recovery email. Request a new verification code."}
          </div>
        )}

        {/* ✅ Success Telemetry Message Hub */}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-950/40 bg-emerald-950/10 p-3 text-control font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" /> {successMessage}
          </div>
        )}

        <form onSubmit={handlePasswordMutationSubmit} className="flex flex-col gap-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-200">OVERWRITE CIPHER CORE</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Configure your new cryptographic security parameter for <span className="text-zinc-400 font-mono text-control break-all">{email || "unknown-channel"}</span>
            </p>
          </div>

          {/* 🔑 FIELD 01: NEW CIPHER */}
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-label font-black uppercase tracking-widest text-zinc-500">New Account Cipher</label>
            <div className="relative w-full">
              <input 
                type={showPasswords ? "text" : "password"}
                required
                disabled={!email || isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="••••••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                disabled={!email || isLoading}
              >
                {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* 🔑 FIELD 02: CONFIRM CIPHER */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label font-black uppercase tracking-widest text-zinc-500">Confirm Account Cipher</label>
            <div className="relative w-full">
              <input 
                type={showPasswords ? "text" : "password"}
                required
                disabled={!email || isLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 pr-10 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors font-mono"
                placeholder="••••••••••••"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                <Lock size={13} />
              </div>
            </div>
          </div>

          {/* 🚀 SUBMIT AND COMMENCE MUTATION EXECUTION */}
          <button
            type="submit"
            disabled={isLoading || !email}
            className={cn(
              "w-full mt-2 rounded-xl py-3 text-xs font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2",
              (!email || isLoading) 
                ? "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800" 
                : "bg-primary hover:bg-red-600 text-white"
            )}
          >
            {isLoading ? (
              <>Mutating Signature Array... <Activity size={12} className="animate-spin" /></>
            ) : (
              <>Commit Security Overwrite &rarr;</>
            )}
          </button>
        </form>

        {/* 🎛️ SYSTEM OVERRIDE FOOTER LINK */}
        <div className="mt-6 text-center text-control font-bold tracking-wide border-t border-zinc-900 pt-4">
          <Link href="/auth/login" className="text-zinc-600 hover:text-primary transition-colors uppercase">
            Cancel and Return to Login Core
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">Loading password reset…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}