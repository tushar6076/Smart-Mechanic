"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";

export default function RootSessionProxyPage() {
  const router = useRouter();

  useEffect(() => {
    async function evaluateAuthVector() {
      try {
        const res = await fetch("/api/auth/session");
        
        if (res.ok) {
          const session = await res.json();
          
          // 🟢 FIXED: Check explicitly if a user payload object exists inside the 200 response
          if (session && session.user) {
            if (session.user.role === "ADMIN") {
              router.replace("/admin");
            } else {
              router.replace("/user");
            }
          } else {
            // No session active: pass them straight to your main intro landing system
            router.replace("/home");
          }
        } else {
          router.replace("/home");
        }
      } catch (err) {
        console.error("Gateway access mapping dropped link:", err);
        router.replace("/home");
      }
    }
    evaluateAuthVector();
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-zinc-400 font-sans select-none">
      <div className="flex flex-col items-center gap-2">
        <Activity className="h-5 w-5 animate-spin text-primary" />
        <span className="text-label font-mono font-black uppercase tracking-widest text-zinc-700">
          Syncing Access Vectors...
        </span>
      </div>
    </div>
  );
}