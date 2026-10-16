"use client";

import { useState } from "react";

interface AdminWorkerActionsProps {
  workerId: string;
  currentStatus: string;
  adminNotes: string;
  meetingLink: string;
}

export default function AdminWorkerActions({
  workerId,
  currentStatus,
  adminNotes: initialNotes,
  meetingLink: initialMeetingLink,
}: AdminWorkerActionsProps) {
  const [status, setStatus] = useState(currentStatus);
  const [adminNotes, setAdminNotes] = useState(initialNotes);
  const [meetingLink, setMeetingLink] = useState(initialMeetingLink);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateStatus = async (nextStatus: string) => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch(`/api/admin/workers/${workerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, adminNotes, meetingLink }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update worker status.");
      setStatus(data.status);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update worker status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current status: {status.replaceAll("_", " ")}</p>
      <label className="block space-y-1 text-xs text-zinc-500">
        Admin notes
        <textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" />
      </label>
      <label className="block space-y-1 text-xs text-zinc-500">
        Interview meeting link
        <input type="url" value={meetingLink} onChange={(event) => setMeetingLink(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" />
      </label>
      <div className="flex flex-wrap gap-2">
        {[
          ["INTERVIEW_SCHEDULED", "Schedule interview"],
          ["APPROVED", "Approve"],
          ["REJECTED", "Reject"],
          ["SUSPENDED", "Suspend"],
        ].map(([nextStatus, label]) => (
          <button key={nextStatus} type="button" disabled={loading || status === nextStatus} onClick={() => updateStatus(nextStatus)} className="rounded-lg border border-zinc-700 px-3 py-2 text-xs font-bold text-zinc-200 hover:border-red-700 disabled:opacity-50">
            {loading ? "Saving…" : label}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {saved && <p role="status" className="text-sm text-emerald-400">Worker status saved.</p>}
    </div>
  );
}
