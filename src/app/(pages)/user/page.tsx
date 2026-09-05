"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Wrench, 
  ShoppingBag, 
  Users, 
  ShieldAlert, 
  MapPin, 
  Star,
  Activity,
  Briefcase,
  AlertCircle
} from "lucide-react";

// ==========================================
// 📋 ALIGNED COMPONENT CONTRACT INTERFACES
// ==========================================
interface WorkerWithUser {
  id: string;
  experience: number;
  status: "PENDING_VERIFICATION" | "INTERVIEW_SCHEDULED" | "APPROVED" | "REJECTED" | "SUSPENDED";
  baseRate: number;
  user: {
    name: string;
  };
  // 🟢 FIXED: Linked directly to your Prisma Schema 'services' model relation array
  services: {
    name: string;
    category: string;
  }[];
  reviews: {
    rating: number;
  }[];
}

interface AssignedAppointment {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  notes: string | null;
  totalPrice: number;
  customer: {
    name: string;
    phone: string | null;
    address: string | null;
  };
}

interface ActiveSessionUser {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "WORKER" | "ADMIN";
}

export default function UserHomePage() {
  // 🔐 Security & Context States
  const [sessionUser, setSessionUser] = useState<ActiveSessionUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // 📊 Live Relational Database States
  const [topWorkers, setTopWorkers] = useState<WorkerWithUser[]>([]);
  const [workerAppointments, setWorkerAppointments] = useState<AssignedAppointment[]>([]);
  const [currentWorkerStatus, setCurrentWorkerStatus] = useState<"PENDING_VERIFICATION" | "INTERVIEW_SCHEDULED" | "APPROVED" | "REJECTED" | "SUSPENDED">("PENDING_VERIFICATION");

  useEffect(() => {
    let isMounted = true;

    async function syncEcosystemTelemetry() {
      try {
        const authResponse = await fetch("/api/auth/session");
        
        if (authResponse.ok) {
          const authData = await authResponse.json();
          
          if (authData && authData.user) {
            if (isMounted) setSessionUser(authData.user);
            
            // Branch execution if role context mirrors a valid database worker row
            if (authData.user.role === "WORKER") {
              const appointmentsResponse = await fetch(`/api/worker/appointments?userId=${authData.user.id}`);
              if (appointmentsResponse.ok) {
                const appointmentsData = await appointmentsResponse.json();
                if (isMounted) setWorkerAppointments(appointmentsData.appointments || []);
              }

              const statusResponse = await fetch(`/api/worker/profile-status?userId=${authData.user.id}`);
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                if (isMounted && statusData.status) {
                  setCurrentWorkerStatus(statusData.status);
                }
              }
            }
          }
        }

        // Independent pipeline query fetch for worker indices layout matching 'APPROVED'
        const publicWorkersResponse = await fetch("/api/public/explore-workers");
        if (publicWorkersResponse.ok) {
          const publicWorkersData = await publicWorkersResponse.json();
          if (isMounted) setTopWorkers(publicWorkersData.workers || []);
        }

      } catch (connectionFault) {
        console.error("Relational schema database communication breakdown:", connectionFault);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    syncEcosystemTelemetry();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-5 w-5 animate-spin text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-700">
            Parsing Schema Connection Node...
          </span>
        </div>
      </div>
    );
  }

  const isGuest = !sessionUser;
  const isWorker = sessionUser?.role === "WORKER";

  const calculateAverageRating = (reviews: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return sum / reviews.length;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20">
      <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* 🚗 VIEW A: CLIENT LAYER & GUEST INTERFACE OVERVIEW        */}
        {/* ========================================================= */}
        {!isWorker && (
          <div className="flex flex-col gap-12">
            
            {/* GREETING NODE */}
            <div className="rounded-2xl border border-zinc-900 bg-gradient-to-br from-zinc-950 to-zinc-900/40 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
              <h1 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter">
                {isGuest ? "DIGITAL GARAGE // GUEST MODE" : `WELCOME BACK, ${sessionUser?.name}`}
              </h1>
              <p className="mt-2 text-xs md:text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Connect directly into our specialized field mechanic layout network. Source precision diagnostics equipment from the marketplace or dispatch technicians right to your structural coordinates.
              </p>
              {isGuest && (
                <div className="mt-4 flex">
                  <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-red-400 transition-colors border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg">
                    // Link Account Node For Complete Operational Privilege
                  </Link>
                </div>
              )}
            </div>

            {/* LIVE QUERY SECTION: INDEX DISCOVERY */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                    Verified Mechanics Active In Chhattisgarh Region
                  </h2>
                </div>
              </div>

              {topWorkers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-900 p-8 text-center text-xs text-zinc-600 italic">
                  No professional diagnostic units currently registering signals on the telemetry table.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {topWorkers.map((worker) => {
                    const avgRating = calculateAverageRating(worker.reviews);
                    return (
                      <div key={worker.id} className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 flex flex-col justify-between hover:border-zinc-800 transition-all duration-200">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wide text-zinc-200">{worker.user?.name || "Unknown Specialist"}</span>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-black">
                              <Star size={12} className="fill-current" /> {avgRating.toFixed(1)}
                            </div>
                          </div>
                          
                          {/* 🟢 FIXED: Reads cleanly from relation query model objects array map block */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {worker.services && worker.services.slice(0, 2).map((srv, idx) => (
                              <span key={idx} className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 rounded">
                                {srv.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-900 pt-3 mt-4 text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-zinc-600">Experience: {worker.experience} Yrs</span>
                          <span className={cn(worker.status === "APPROVED" ? "text-emerald-500" : "text-amber-500")}>
                            // {worker.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PRODUCT FORECAST DECK */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <ShoppingBag size={16} className="text-primary" />
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                  Precision Industrial Tooling Pipeline
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {["Diagnostic Telemetry Rig", "Heavy Pressure Gauges", "Calibrated Impact Sets"].map((item, index) => (
                  <div key={index} className="rounded-xl border border-zinc-900 p-6 bg-zinc-950/20 flex flex-col justify-between items-start group hover:border-zinc-800 transition-colors">
                    <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">SYS-INVENTORY-NODES</span>
                    <h4 className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-wide">{item}</h4>
                    <Link href="/user/explore/products" className="text-[9px] font-black uppercase tracking-widest text-primary mt-4 hover:text-white transition-colors">
                      Query Stock Data &rarr;
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 🔧 VIEW B: WORKER CONTROL MATRIX COMMAND CELL             */}
        {/* ========================================================= */}
        {isWorker && (
          <div className="flex flex-col gap-8">
            
            {currentWorkerStatus === "PENDING_VERIFICATION" && (
              <div className="rounded-2xl border border-red-950/40 bg-red-950/10 p-5 flex items-start gap-4 animate-fade-in">
                <div className="rounded-lg bg-red-950 border border-red-900 text-red-400 p-2 shrink-0">
                  <ShieldAlert size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-red-400">
                    Roster Security Verification Protocol Pending
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-500 mt-1 max-w-4xl">
                    Your core mechanical verification application is processing. Your active listing profile state remains invisible to customer global searching index arrays until profile parameters are validated by an admin node inside <code className="text-zinc-400 font-mono">/admin</code>.
                  </p>
                </div>
              </div>
            )}

            {currentWorkerStatus === "SUSPENDED" && (
              <div className="rounded-2xl border border-red-900 bg-red-950/20 p-5 flex items-start gap-4">
                <div className="rounded-lg bg-red-900 text-white p-2 shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white">
                    Operational Pipeline Account Suspended
                  </h3>
                  <p className="text-xs leading-relaxed text-red-300/60 mt-1">
                    Your deployment interface has been disconnected due to standard compliance protocols. Reach out to support to audit transaction behaviors.
                  </p>
                </div>
              </div>
            )}

            {/* LIVE ASSIGNED TICKET STAGES */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Briefcase size={16} className="text-primary" />
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-200">
                  Assigned Operational Pipeline Tasks
                </h2>
              </div>

              {workerAppointments.length === 0 ? (
                <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-8 text-center text-xs text-zinc-600 italic">
                  No active operational tickets assigned to your distinct worker row at this coordinate cycle.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {workerAppointments.map((job) => (
                    <div key={job.id} className="rounded-xl border border-zinc-900 bg-zinc-950/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-800 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-primary tracking-wider">
                            {job.id}
                          </span>
                          <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wide">
                            {job.customer?.name || "Client"}
                          </h4>
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                            job.status === "CONFIRMED" ? "bg-cyan-950 text-cyan-400 border border-cyan-900" :
                            job.status === "IN_PROGRESS" ? "bg-amber-950 text-amber-400 border border-amber-900" :
                            "bg-zinc-900 text-zinc-500 border border-zinc-800"
                          )}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1.5">
                          <span className="text-zinc-600 font-bold uppercase text-[10px] tracking-wider">Statement:</span> {job.notes || "No notes submitted."}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                          Scheduled Execution Period: {new Date(job.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-col md:items-end justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                          <MapPin size={13} className="text-zinc-600" /> {job.customer?.address || "Field Coordinates Unassigned"}
                        </div>
                        <span className="text-[11px] font-black tracking-tight text-white mt-1">
                          Settlement Value: ₹{job.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}