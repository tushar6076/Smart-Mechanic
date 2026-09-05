"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Users, Search, Star, MapPin, 
  Briefcase, ArrowRight, ShieldCheck, Activity 
} from "lucide-react";

interface WorkerCatalogItem {
  id: string;
  experience: number;
  baseRate: number;
  customSkills: string | null;
  status: string;
  user: {
    name: string;
    address: string | null;
  };
  services: { id: string; name: string }[];
  reviews: { rating: number }[];
}

export default function ExploreWorkersCatalog() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [workers, setWorkers] = useState<WorkerCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const res = await fetch("/api/public/explore/workers");
        if (res.ok) {
          const data = await res.json();
          // Filter out suspended or unapproved records natively
          setWorkers((data.workers || []).filter((w: any) => w.status === "APPROVED"));
        }
      } catch (err) {
        console.error("Failed loading worker index:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter((w) => 
    w.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.customSkills && w.customSkills.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-zinc-400 font-sans pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        <div className="relative w-full">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter localized engineering rosters by name or alignment..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 pl-9 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 flex flex-col justify-between hover:border-zinc-800 transition-all group">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black uppercase text-zinc-200 tracking-wide">{worker.user.name}</span>
                      <ShieldCheck size={13} className="text-primary" />
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono block mt-1">{worker.user.address || "Chhattisgarh Base"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                    <Star size={11} className="fill-current" /> 5.0
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  {worker.services.map(s => (
                    <span key={s.id} className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-bold text-zinc-400 uppercase rounded">{s.name}</span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Base Deployment</span>
                  <span className="text-xs font-black text-white mt-0.5">₹{worker.baseRate.toFixed(2)}/hr</span>
                </div>
                <Link href={`/user/appointment?workerId=${worker.id}`} className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:border-primary px-3 py-2 rounded-lg flex items-center gap-1 transition-all">
                  Book Slot <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}