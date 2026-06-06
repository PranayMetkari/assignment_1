import { Lead } from "../types/lead";
import StatusBadge from "./StatusBadge";
import Link from "next/link";

interface LeadCardProps {
  lead: Lead;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-pink-500 to-fuchsia-600",
];

function getGradient(name: string): string {
  const i =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length;
  return GRADIENTS[i];
}

export default function LeadCard({ lead }: LeadCardProps) {
  const gradient = getGradient(lead.name);
  const initials = getInitials(lead.name);

  return (
    <Link href={`/leads/${lead.id}`} className="group block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/60 hover:shadow-xl hover:shadow-black/40">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-zinc-100 truncate group-hover:text-white">
                {lead.name}
              </h2>
              <p className="text-sm text-zinc-500 truncate">{lead.email}</p>
            </div>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800 mb-3" />

        {/* Meta */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-zinc-400">
            <svg className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            </svg>
            {lead.company}
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <svg className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(lead.createdAt)}
          </div>
        </div>

        {/* Hover arrow */}
        <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            View details
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>

      </div>
    </Link>
  );
}