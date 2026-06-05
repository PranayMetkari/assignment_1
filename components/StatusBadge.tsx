import { LeadStatus } from "../types/lead";

interface StatusBadgeProps {
  status: LeadStatus;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  const statusStyles = {
    New: "bg-yellow-500 text-black",
    Contacted: "bg-blue-500 text-white",
    Qualified: "bg-green-500 text-white",
    Lost: "bg-red-500 text-white",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}