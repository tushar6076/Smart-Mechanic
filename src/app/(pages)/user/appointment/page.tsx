"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Wrench, 
  User, 
  Clock, 
  MapPin, 
  FileText, 
  Activity, 
  ArrowLeft,
  AlertTriangle 
} from "lucide-react";

function AppointmentFormCore() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Dynamic parsing of potential query parameters pushed from inventory or engineering logs
  const preselectedWorkerId = searchParams.get("workerId") || "";

  // 📝 Master Dynamic State Bindings
  const [workerId, setWorkerId] = useState(preselectedWorkerId);
  const [vehicleType, setVehicleType] = useState("SEDAN");
  const [vehicleModel, setVehicleModel] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");

  // 📡 Structural Validation Matrices
  const [targetWorkerName, setTargetWorkerName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize target worker telemetry context dynamically if routed from rosters
  useEffect(() => {
    if (preselectedWorkerId) {
      async function verifyWorkerProfileNode() {
        try {
          const res = await fetch(`/api/public/explore-workers/${preselectedWorkerId}`);
          if (res.ok) {
            const data = await res.json();
            // Staging target metadata parameter dynamically
            setTargetWorkerName(data.worker?.user?.name || null);
          }
        } catch (err) {
          console.error("Failed parsing specialist reference parameter:", err);
        }
      }
      verifyWorkerProfileNode();
    }
  }, [preselectedWorkerId]);

  const handleDispatchSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Validation metrics verification check
    if (!scheduledAt || !vehicleModel.trim() || !address.trim()) {
      setErrorMessage("Complete all strict compliance metrics prior to launching dispatch vectors.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 🟢 COMPLIANT ACTION: Unified endpoint strategy handles mapping
      // The upstream middleware handles session processing cleanly via headers.
      const response = await fetch("/api/user/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: workerId || null,
          vehicleType,
          vehicleModel: vehicleModel.trim(),
          scheduledAt: new Date(scheduledAt).toISOString(),
          notes: notes.trim(),
          address: address.trim()
        }),
      });

      const result = await response.json();

      if (response.ok && result.appointmentId) {
        // Handoff to status router node parameter
        router.push(`/user/cart/payment/status?type=appointment&status=success&ref=${result.appointmentId}`);
      } else {
        router.push(`/user/cart/payment/status?type=appointment&status=failed`);
      }
    } catch (err) {
      console.error("Scheduler communications timeout event:", err);
      router.push(`/user/cart/payment/status?type=appointment&status=failed`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 font-sans pb-20 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        <Link href="/user/explore/workers" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors w-fit">
          <ArrowLeft size={12} /> Return to Engineering Rosters
        </Link>

        {/* METRIC HEADER DISPLAY SYSTEM */}
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
            <Calendar size={14} /> // DISPATCH REQUEST ENGINE
          </div>
          <h1 className="text-xl font-black text-white uppercase mt-1 tracking-tight">LOGISTICS APPOINTMENT DISPATCHER</h1>
          <p className="text-xs text-zinc-500 mt-1">Submit mechanical parameters and target parameters to lock down localized field technicians.</p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-950/40 bg-red-950/10 p-3 text-[11px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0 text-primary animate-pulse" /> {errorMessage}
          </div>
        )}

        {/* LOGISTICS DATA ENTRY INTERFACE */}
        <form onSubmit={handleDispatchSubmission} className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-5 sm:p-6 flex flex-col gap-5">
          
          {/* ASSIGNED SPECIALIST METADATA NODE (DYNAMIC SHIFT) */}
          {targetWorkerName && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3 text-xs text-zinc-200">
              <User size={14} className="text-primary" />
              <span className="font-mono uppercase tracking-wide">
                LOCKING TARGET ENGINEER: <strong className="text-white font-black">{targetWorkerName}</strong>
              </span>
            </div>
          )}

          {/* ASSET METADATA ENTRY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                <Wrench size={12} /> Core Unit Matrix Class
              </label>
              <select
                title="Select Vehicle Type"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors font-bold uppercase tracking-wider appearance-none"
              >
                <option value="SEDAN">Sedan Fleet Class</option>
                <option value="SUV">SUV/Heavy Class</option>
                <option value="HATCHBACK">Compact Hatchback</option>
                <option value="LUXURY">Performance/Luxury Class</option>
                <option value="TWO_WHEELER">Two-Wheeler Transport</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                <FileText size={11} /> Specific Model Blueprint
              </label>
              <input 
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g., Honda Civic 2024 / Tata Nexon"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none placeholder-zinc-600 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* WINDOW HORIZON PERIOD CHRONO */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
              <Clock size={12} /> Target Execution Period Window
            </label>
            <input 
              title="Select Scheduled Date and Time"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors uppercase font-mono font-bold tracking-wider"
            />
          </div>

          {/* GEOLOCATION MATRIX */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
              <MapPin size={12} /> Physical Coordinates Destination Address
            </label>
            <input 
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Provide clean house coordinates or local street sectors..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* SYMPTOM REPORTING LOGS AREA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Symptom Description Statement Log
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe current diagnostic faults (e.g., system anomalies, mechanical drop metrics)..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-primary transition-colors resize-none font-medium leading-relaxed"
            />
          </div>

          {/* PROCESSING BOUND ACTION ACTUATOR */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 rounded-xl bg-primary hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest py-3.5 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/10"
          >
            {isSubmitting ? (
              <>Binding Matrix Schedules... <Activity size={12} className="animate-spin" /></>
            ) : (
              "Commit Field Dispatch Request"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

// 📦 Root Dynamic Shell Provider
export default function AppointmentFormPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <Activity className="h-4 w-4 animate-spin text-primary" />
      </div>
    }>
      <AppointmentFormCore />
    </Suspense>
  );
}