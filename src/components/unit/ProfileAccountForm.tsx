"use client";

import { useState } from "react";

interface ProfileFormValues {
  name: string;
  phone: string | null;
  address: string | null;
}

export default function ProfileAccountForm({ initialValues }: { initialValues: ProfileFormValues }) {
  const [name, setName] = useState(initialValues.name);
  const [phone, setPhone] = useState(initialValues.phone || "");
  const [address, setAddress] = useState(initialValues.address || "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Profile could not be saved.");
      setMessage("Your profile has been updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Profile could not be saved.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
      <label className="block space-y-1 text-xs text-zinc-500">Name<input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
      <label className="block space-y-1 text-xs text-zinc-500">Phone<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
      <label className="block space-y-1 text-xs text-zinc-500">Address<textarea value={address} onChange={(event) => setAddress(event.target.value)} rows={3} className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white" /></label>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
      <button disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{loading ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
