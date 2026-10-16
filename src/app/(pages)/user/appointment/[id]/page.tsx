"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  Wrench, 
  User, 
  Clock, 
  FileText,
  Star,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentDetails {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  vehicleType: string;
  vehicleModel: string;
  scheduledAt: string;
  notes: string | null;
  address: string;
  totalPrice: number;
  customerId: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
  };
  worker: {
    id: string;
    user: {
      name: string;
      phone: string | null;
    };
  } | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppointmentTrackingRoomPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<"CUSTOMER" | "WORKER" | "ADMIN">("CUSTOMER");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);

  // ⭐️ Review Input State Vectors
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    async function syncTrackingTelemetry() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          if (sessionData?.user) setCurrentUserRole(sessionData.user.role);
        }

        // 🟢 FIXED: Reads from the common user space route logic we discussed
        const res = await fetch(`/api/user/appointments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAppointment(data.appointment);
        } else {
          router.push("/user");
        }
      } catch (err) {
        console.error("Failed loading assignment logs:", err);
      } finally {
        setIsLoading(false);
      }
    }
    syncTrackingTelemetry();
  }, [id, router]);

  const handleUpdateStatus = async (targetStatus: AppointmentDetails["status"]) => {
    setIsMutating(true);
    setStatusError(null);
    try {
      // 🟢 FIXED: Hits our specific worker update-status override endpoint precisely
      const res = await fetch(`/api/user/workers/appointments/update-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: id, status: targetStatus }),
      });

      if (res.ok) {
        setAppointment(prev => prev ? { ...prev, status: targetStatus } : null);
      } else {
        const data = await res.json();
        setStatusError(data.error || "Appointment status could not be updated.");
      }
    } catch (err) {
      console.error("Failsafe interceptor blocked state transition mutation:", err);
      setStatusError("Could not reach the appointment service. Please try again.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment?.worker?.id) return;
    setIsMutating(true);
    setReviewError(null);

    try {
      // 🟢 FIXED: Submits via the private customer evaluation path structure cleanly
      const res = await fetch("/api/user/customers/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: appointment.worker.id,
          rating,
          comment: comment.trim()
        }),
      });

      if (res.ok) {
        setReviewSubmitted(true);
      } else {
        const errData = await res.json();
        setReviewError(errData.error || "Review verification submission drop.");
      }
    } catch (err) {
      console.error("Review operational communication drop:", err);
      setReviewError("Network communication latency timeout.");
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) return null;

  const isWorkerPerspective = currentUserRole === "WORKER";
  const showReviewConsole = !isWorkerPerspective && appointment.status === "COMPLETED" && appointment.worker?.id;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        <Link href="/user" className="text-zinc-600 hover:text-white transition-colors w-fit flex items-center gap-2 text-label font-black uppercase tracking-widest">
          <ArrowLeft size={12} /> Exit Dashboard View
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
          <div>
            <span className="text-label font-mono font-bold text-primary tracking-widest uppercase block">TICKET ID: {appointment.id}</span>
            <h1 className="text-xl font-black text-white uppercase mt-1 tracking-tight">
              {appointment.vehicleModel} Diagnostics Monitor
            </h1>
          </div>
          
          <span className={cn(
            "text-label font-mono font-black px-3 py-1.5 rounded-lg border tracking-widest uppercase w-fit shrink-0",
            appointment.status === "PENDING" ? "bg-zinc-900 text-zinc-500 border-zinc-800" :
            appointment.status === "CONFIRMED" ? "bg-cyan-950/40 text-cyan-400 border-cyan-900" :
            appointment.status === "IN_PROGRESS" ? "bg-amber-950/40 text-amber-400 border-amber-900" :
            appointment.status === "COMPLETED" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900" :
            "bg-red-950/40 text-red-400 border-red-900"
          )}>
            STATUS: {appointment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2 border-b border-zinc-900 pb-2">
                <FileText size={13} className="text-primary" /> LOGISTICS MANIFEST METRICS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-control leading-relaxed">
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-600 uppercase">Fleet Class Asset:</span>
                  <span className="text-zinc-300 font-bold">{appointment.vehicleType}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-600 uppercase">Execution Window:</span>
                  <span className="text-zinc-300 font-bold">{new Date(appointment.scheduledAt).toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-0.5 sm:col-span-2 border-t border-zinc-900 pt-2 mt-1">
                  <span className="text-zinc-600 uppercase">Coordinate Target Vector:</span>
                  <span className="text-zinc-300 font-bold flex items-center gap-1">
                    <MapPin size={11} className="text-zinc-500" /> {appointment.address}
                  </span>
                </div>
              </div>

              {appointment.notes && (
                <div className="border-t border-zinc-900 pt-3 flex flex-col gap-1.5">
                  <span className="text-micro font-black uppercase tracking-widest text-zinc-600">Operator Symptom Statement:</span>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                  {appointment.notes}
                  </p>
                </div>
              )}
            </div>

            {statusError && <p role="alert" className="rounded-lg border border-red-900/60 bg-red-950/20 p-3 text-sm text-red-300">{statusError}</p>}

            {/* WORKER STATE HOTKEYS */}
            {isWorkerPerspective && appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED" && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    <Wrench size={13} className="text-primary" /> Technician State Override Panel
                  </h3>
                  <p className="text-control text-zinc-500 mt-0.5 font-medium">Advance the active task status pipeline matching your real-time processing milestones.</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {appointment.status === "PENDING" && (
                    <button
                      onClick={() => handleUpdateStatus("CONFIRMED")}
                      disabled={isMutating}
                      className="rounded-lg bg-primary hover:bg-red-600 text-white font-black uppercase text-label tracking-widest px-4 py-2.5 transition-all shadow-md shadow-primary/10"
                    >
                      Confirm Appointment
                    </button>
                  )}
                  {appointment.status === "CONFIRMED" && (
                    <button
                      onClick={() => handleUpdateStatus("IN_PROGRESS")}
                      disabled={isMutating}
                      className="rounded-lg bg-primary hover:bg-red-600 text-white font-black uppercase text-label tracking-widest px-4 py-2.5 transition-all shadow-md shadow-primary/10"
                    >
                      Initialize Operations [IN_PROGRESS]
                    </button>
                  )}
                  {appointment.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => handleUpdateStatus("COMPLETED")}
                      disabled={isMutating}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-label tracking-widest px-4 py-2.5 transition-all shadow-md shadow-emerald-900/10"
                    >
                      Finalize & Close Ticket [COMPLETED]
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* CONDITIONAL CUSTOMER REVIEW FORM ENGINE CONTAINER */}
            {showReviewConsole && (
              <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-5 flex flex-col gap-4">
                <div className="border-b border-zinc-900 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-1.5">
                    <Star size={13} className="text-amber-500" /> Dispatch Performance Appraisal Manifest
                  </h3>
                  <p className="text-control text-zinc-500 mt-0.5 font-medium">Log performance parameters for the assigned field engineer.</p>
                </div>

                {reviewSubmitted ? (
                  <div className="rounded-lg bg-emerald-950/20 border border-emerald-900 p-4 flex items-center gap-2.5 text-xs text-emerald-400 font-bold uppercase tracking-wide">
                    <CheckCircle2 size={16} /> Appraisal Matrix Compiled & Staged Successfully.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmission} className="flex flex-col gap-4">
                    {reviewError && (
                      <div className="text-label font-bold uppercase tracking-wide text-red-400 bg-red-950/10 border border-red-900 p-2.5 rounded-lg">
                        {reviewError}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-micro font-black uppercase tracking-widest text-zinc-500">Appraisal Rating Index</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((idx) => (
                          <button
                            title={`Rate ${idx} Star${idx > 1 ? "s" : ""}`}
                            key={idx}
                            type="button"
                            onClick={() => setRating(idx)}
                            className="text-zinc-600 hover:text-amber-500 transition-colors"
                          >
                            <Star size={18} className={cn("transition-all", idx <= rating ? "text-amber-500 fill-current" : "text-zinc-800")} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-micro font-black uppercase tracking-widest text-zinc-500">Appraisal Commentary Statement</label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Log detailed service feedback descriptions..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors resize-none font-medium leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isMutating}
                      className="w-fit rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-black uppercase text-label tracking-widest px-4 py-2.5 transition-all"
                    >
                      {isMutating ? "Compiling Logs..." : "Commit Appraisal Log"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex flex-col gap-3">
              <h4 className="text-label font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                {isWorkerPerspective ? <User size={12} /> : <Wrench size={12} />} 
                {isWorkerPerspective ? "Customer Metadata" : "Assigned Specialist"}
              </h4>

              {isWorkerPerspective ? (
                <div className="flex flex-col gap-1 font-mono text-control">
                  <span className="text-zinc-300 font-bold uppercase">{appointment.customer.name}</span>
                  <span className="text-zinc-600 uppercase mt-0.5">TEL: {appointment.customer.phone || "No direct trunk trace"}</span>
                </div>
              ) : appointment.worker ? (
                <div className="flex flex-col gap-1 font-mono text-control">
                  <span className="text-zinc-300 font-bold uppercase flex items-center gap-1">
                    {appointment.worker.user.name} <ShieldCheck size={12} className="text-primary" />
                  </span>
                  <span className="text-zinc-600 uppercase mt-0.5">TEL: {appointment.worker.user.phone || "Encrypted via proxy"}</span>
                </div>
              ) : (
                <div className="text-control font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5 py-1">
                  <Clock size={12} className="animate-pulse" /> Unassigned Node Queue Pool
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex flex-col gap-1.5">
              <span className="text-micro font-black uppercase tracking-widest text-zinc-600">Settlement Valuation</span>
              <span className="text-base font-mono font-black text-white mt-0.5">₹{appointment.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}