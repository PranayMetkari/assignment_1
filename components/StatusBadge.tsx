import { LeadStatus } from "../types/lead";

interface StatusBadgeProps {
  status: LeadStatus;
}

const CONFIG: Record<LeadStatus, { dot: string; badge: string }> = {
  New:       { dot: "bg-yellow-400",  badge: "bg-yellow-400/10 border border-yellow-400/30 text-yellow-300" },
  Contacted: { dot: "bg-blue-400",    badge: "bg-blue-400/10 border border-blue-400/30 text-blue-300" },
  Qualified: { dot: "bg-emerald-400", badge: "bg-emerald-400/10 border border-emerald-400/30 text-emerald-300" },
  Lost:      { dot: "bg-red-400",     badge: "bg-red-400/10 border border-red-400/30 text-red-300" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { dot, badge } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}