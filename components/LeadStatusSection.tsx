"use client";

import { useState } from "react";
import { LeadStatus } from "../types/lead";
import StatusSelector from "./StatusSelector";
import StatusBadge from "./StatusBadge";

interface LeadStatusSectionProps {
    leadId: string;
    initialStatus: LeadStatus;
    // Static detail rows passed in from the server component
    detailRows: { label: string; value: string }[];
}

export default function LeadStatusSection({
    leadId,
    initialStatus,
    detailRows,
}: LeadStatusSectionProps) {
    // Single source of truth for status on this page
    const [status, setStatus] = useState<LeadStatus>(initialStatus);

    return (
        <>
            {/* Pipeline Stage panel */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="text-sm font-semibold text-zinc-300 mb-4">
                    Pipeline Stage
                </h2>
                <StatusSelector
                    leadId={leadId}
                    initialStatus={status}
                    onStatusChange={setStatus}   // ← called on every status change
                />
            </div>

            {/* Lead Details table — status row reads from live state */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
                <h2 className="text-sm font-semibold text-zinc-300 mb-4">
                    Lead Details
                </h2>
                <div className="divide-y divide-zinc-800">

                    {/* Static rows (name, email, company, id, created) */}
                    {detailRows.map(({ label, value }) => (
                        <div
                            key={label}
                            className="flex items-center justify-between py-3 text-sm"
                        >
                            <span className="text-zinc-500 w-28 flex-shrink-0">{label}</span>
                            <span className="text-zinc-300 text-right">{value}</span>

                        </div>
                    ))}

                    {/* Status row — updates instantly when Pipeline Stage is changed */}
                    <div className="flex items-center justify-between py-3 text-sm">
                        <span className="text-zinc-500 w-28 flex-shrink-0">Status</span>
                        <span className="text-right">
                            <StatusBadge status={status} />
                        </span>
                    </div>

                </div>
            </div>
        </>
    );
}