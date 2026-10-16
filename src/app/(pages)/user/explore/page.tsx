"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Wrench, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Cpu, 
  Gauge, 
  Bolt,
  ArrowRight,
  Activity
} from "lucide-react";

// Map dynamic slugs to Lucide icons safely on the client side
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  diagnostics: Cpu,
  pressure: Gauge,
  tooling: Wrench,
  electrical: Bolt,
};

export default function ExploreOverviewPage() {
  const router = useRouter();
  const [globalQuery, setGlobalQuery] = useState("");
  const [productCategories, setProductCategories] = useState<{ name: string; slug: string; count: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalQuery.trim()) return;
    
    const query = globalQuery.toLowerCase();
    if (query.includes("mechanic") || query.includes("worker") || query.includes("engineer")) {
      router.push(`/user/explore/workers?q=${encodeURIComponent(globalQuery)}`);
    } else {
      router.push(`/user/explore/products?q=${encodeURIComponent(globalQuery)}`);
    }
  };

  useEffect(() => {
    async function syncCategoryTelemetry() {
      try {
        const res = await fetch("/api/public/explore");
        if (res.ok) {
          const data = await res.json();
          setProductCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Error reading live categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    syncCategoryTelemetry();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        
        {/* HERO SEARCH ENGINE BANNER */}
        <div className="rounded-2xl border border-zinc-900 bg-gradient-to-b from-zinc-900/30 to-zinc-950 p-8 text-center relative overflow-hidden shadow-2xl">
          <div className="app-brand-glow absolute inset-0 pointer-events-none" />
          
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white italic">
            SEARCH THE ECOSYSTEM INDEX
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-2 max-w-xl mx-auto">
            Query our unified database catalog vector to source precision hardware components or dispatch local field service specialists.
          </p>

          <form onSubmit={handleGlobalSearchSubmit} className="max-w-2xl mx-auto mt-6 relative">
            <input 
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Type equipment nodes or mechanical service specs (e.g., 'ECU Rig', 'Tuning')..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 pl-11 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary transition-colors shadow-inner font-medium"
            />
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-red-600 text-white font-black uppercase text-label tracking-widest px-3 py-1.5 rounded-lg transition-colors">
              Execute Query
            </button>
          </form>
        </div>

        {/* BRANCHE DIRECTORY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between items-start group hover:border-zinc-800 transition-all">
            <div>
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-2 text-primary w-fit">
                <Users size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white mt-4">// FIELD ENGINEERING OPERATIONS</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Connect into local deployment tracks. Query verified engineering specialists, check customer ratings vectors, and schedule remote site diagnostics.</p>
            </div>
            <Link href="/user/explore/workers" className="mt-6 flex items-center gap-1.5 text-label font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
              Open Workers Directory <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-6 flex flex-col justify-between items-start group hover:border-zinc-800 transition-all">
            <div>
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 w-fit">
                <ShoppingBag size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white mt-4">// SUPPLY LINE INTERFACE</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Source heavy industrial tooling parameters, replacement components, and calibrated gauge diagnostics hardware instruments.</p>
            </div>
            <Link href="/user/explore/products" className="mt-6 flex items-center gap-1.5 text-label font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
              Browse Tools Catalog <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* HARDWARE MARKETPLACE CATEGORIES MATRIX */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <TrendingUp size={14} className="text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-200">Trending Sourcing Frameworks</h2>
          </div>
          
          {loadingCategories ? (
            <div className="flex items-center justify-center py-10 w-full">
              <Activity size={16} className="animate-spin text-primary mr-2" />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-600">Reading Catalog States...</span>
            </div>
          ) : productCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-900 p-8 text-center text-xs text-zinc-600 italic">
              No active categories populated in database metrics.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productCategories.map((cat, idx) => {
                // Dynamically resolve icon or fall back to default ShoppingBag component safely
                const TargetIcon = ICON_MAP[cat.slug] || ShoppingBag;
                
                return (
                  <Link 
                    key={idx}
                    href={`/user/explore/products?category=${cat.slug}`}
                    className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-4 flex flex-col items-center text-center gap-2 hover:border-zinc-800 transition-colors group"
                  >
                    <div className="rounded-full bg-zinc-900 border border-zinc-800 p-3 text-zinc-500 group-hover:text-primary transition-colors">
                      <TargetIcon size={16} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-300 group-hover:text-white transition-colors mt-1 truncate max-w-full">
                      {cat.name}
                    </span>
                    <span className="text-label font-mono tracking-wider text-zinc-600">{cat.count}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}