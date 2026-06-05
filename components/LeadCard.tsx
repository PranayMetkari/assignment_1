import { Lead } from "../types/lead";
import StatusBadge from "./StatusBadge";
import Link from "next/link";
interface LeadCardProps {
    lead: Lead;
}

export default function LeadCard({
    lead,
}: LeadCardProps) {
    return (
        <Link href={`/leads/${lead.id}`}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 h-full hover:border-zinc-600 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-semibold">
                                {lead.name}
                            </h2>

                            <StatusBadge status={lead.status} />
                        </div>

                        <p className="text-zinc-400 mt-2">
                            {lead.email}
                        </p>

                        <p className="mt-2">
                            <span className="text-zinc-500">
                                Company:
                            </span>{" "}
                            {lead.company}
                        </p>
                        <p className="mt-2 text-sm text-zinc-500">
                            Created: {lead.createdAt}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}