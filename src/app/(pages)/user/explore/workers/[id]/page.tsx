"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Briefcase, 
  Wrench, 
  Calendar, 
  Activity,
  ArrowRight
} from "lucide-react";

interface WorkerDetails {
  id: string;
  experience: number;
  baseRate: number;
  customSkills: string | null;
  status: string;
  user: {
    name: string;
    email: string;
    address: string | null;
    profilePic: string | null;
  };
  services: {
    id: string;
    name: string;
    category: string;
  }[];
}

interface WorkerPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkerProfileDynamicPage({ params }: WorkerPageProps) {
  const router = useRouter();
  const { id } = use(params);

  // 📊 Local Telemetry State Machines
  const [worker, setWorker] = useState<WorkerDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadWorkerProfileNode() {
      try {
        const res = await fetch(`/api/public/explore/workers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setWorker(data.worker);
        } else {
          router.push("/user/explore/workers");
        }
      } catch (err) {
        console.error("Profile extraction tracking sequence fail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkerProfileNode();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* DISMISS BACK-LINK POINTER */}
        <Link 
          href="/user/explore/workers" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={12} /> Return to Engineering Rosters
        </Link>

        {/* PROFILE DOSSIER STRUCTURAL LAYOUT CARD */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/[0.02] blur-[80px] pointer-events-none" />
          
          <div className="flex items-center gap-4">
            {/* AVATAR FRAME OBJECT */}
            <div className="h-16 w-16 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex items-center justify-center font-mono text-zinc-700 text-xs shrink-0">
              {worker.user.profilePic ? (
                <img src={worker.user.profilePic} alt={worker.user.name} className="w-full h-full object-cover" />
              ) : <Briefcase size={20} />}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-white uppercase tracking-tight">{worker.user.name}</h1>
                <ShieldCheck size={15} className="text-primary" />
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-500 uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1"><Briefcase size={12} /> {worker.experience} Years Active</span>
                <span className="flex items-center gap-1"><MapPin size={11} /> {worker.user.address || "Zone Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* BASE DEPLOYMENT RATE MATRIX BOX */}
          <div className="border-t sm:border-t-0 sm:border-l border-zinc-900 pt-4 sm:pt-0 sm:pl-6 flex flex-col items-start sm:items-end justify-center shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Operational Value</span>
            <span className="text-xl font-black text-white mt-0.5">₹{worker.baseRate.toFixed(2)}/hr</span>
            <div className="flex items-center gap-1 text-amber-500 text-[10px] font-black mt-1 uppercase tracking-wide bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
              <Star size={11} className="fill-current" /> 5.0 Core Index
            </div>
          </div>
        </div>

        {/* METRICS SPECS ACCORDION BLOCKS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* COMPETENCY METRICS PANEL */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-5 flex flex-col gap-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Wrench size={13} className="text-primary" /> Verified Engineering Specialties
              </h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {worker.services.map((svc) => (
                  <div key={svc.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 flex flex-col gap-0.5 text-left w-full sm:w-[48%]">
                    <span className="text-[11px] font-black uppercase text-zinc-300 tracking-wide">{svc.name}</span>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase mt-0.5">CAT: ${svc.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECONDARY CUSTOM FALLBACK SKILLS DISPLAY CONTAINER */}
            {worker.customSkills && (
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-5 flex flex-col gap-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">// UNLISTED FIELD COMPETENCIES EXTENSIONS</h4>
                <p className="text-xs text-zinc-400 font-mono italic leading-relaxed">
                  "{worker.customSkills}"
                </p>
              </div>
            )}
          </div>

          {/* ACTION BUTTON TRIGGER DEPLOYMENT DISPATCH SIDEBLOCK */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/50 p-5 flex flex-col gap-4 sticky top-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-1.5">
                <Calendar size={13} className="text-primary" /> Deployment Action
              </h4>
              <p className="text-[11px] text-zinc-500 mt-1 leading-normal">
                Initialize a physical diagnostic request log routing directly to this technician.
              </p>
            </div>

            <Link 
              href={`/user/appointment?workerId=${worker.id}`}
              className="w-full rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-red-600 transition-all text-center flex items-center justify-center gap-1.5 shadow-md shadow-primary/10"
            >
              Dispatch Ticket Request <ArrowRight size={12} />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}