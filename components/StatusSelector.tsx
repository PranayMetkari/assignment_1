"use client";

import { useState } from "react";
import { LeadStatus } from "../types/lead";

interface StatusSelectorProps {
  leadId: string;
  initialStatus: LeadStatus;
  onStatusChange?: (status: LeadStatus) => void; // ← new optional prop
}

const STATUSES: {
  value: LeadStatus;
  colors: string;
  activeColors: string;
}[] = [
  {
    value: "New",
    colors:
      "border-zinc-700 text-zinc-400 hover:border-yellow-500/50 hover:text-yellow-400",
    activeColors: "border-yellow-500 bg-yellow-500/10 text-yellow-300",
  },
  {
    value: "Contacted",
    colors:
      "border-zinc-700 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400",
    activeColors: "border-blue-500 bg-blue-500/10 text-blue-300",
  },
  {
    value: "Qualified",
    colors:
      "border-zinc-700 text-zinc-400 hover:border-green-500/50 hover:text-green-400",
    activeColors: "border-green-500 bg-green-500/10 text-green-300",
  },
  {
    value: "Lost",
    colors:
      "border-zinc-700 text-zinc-400 hover:border-red-500/50 hover:text-red-400",
    activeColors: "border-red-500 bg-red-500/10 text-red-300",
  },
];

export default function StatusSelector({
  leadId,
  initialStatus,
  onStatusChange,
}: StatusSelectorProps) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (newStatus: LeadStatus) => {
    if (newStatus === status || saving) return;

    const previous = status;

    // 1. Update local state immediately (optimistic)
    setStatus(newStatus);

    // 2. Notify parent so Lead Details badge updates too
    onStatusChange?.(newStatus);

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Rollback both local state and parent state
        setStatus(previous);
        onStatusChange?.(previous);
        setError(data.error ?? "Update failed. Please try again.");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch {
      // Rollback on network error
      setStatus(previous);
      onStatusChange?.(previous);
      setError("Network error. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const isActive = status === s.value;
          return (
            <button
              key={s.value}
              onClick={() => handleChange(s.value)}
              disabled={saving}
              aria-pressed={isActive}
              className={`
                px-4 py-2 rounded-lg border text-sm font-medium
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive ? s.activeColors : s.colors}
              `}
            >
              {s.value}
            </button>
          );
        })}
      </div>

      <div className="h-5 flex items-center gap-2">
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Saving…
          </span>
        )}
        {saved && !saving && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Status updated
          </span>
        )}
        {error && !saving && (
          <span className="text-xs text-red-400">⚠ {error}</span>
        )}
      </div>
    </div>
  );
}