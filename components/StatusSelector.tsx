"use client";

import { useState } from "react";
import { LeadStatus } from "../types/lead";

interface StatusSelectorProps {
    leadId: string;
    initialStatus: LeadStatus;
}

export default function StatusSelector({
    leadId,
    initialStatus,
}: StatusSelectorProps) {
    const [status, setStatus] =
        useState<LeadStatus>(initialStatus);

    return (
        <div>
            <label className="text-zinc-500 block mb-2">
                Status
            </label>

            <select
                value={status}
                onChange={async (e) => {
                    const newStatus =
                        e.target.value as LeadStatus;

                    setStatus(newStatus);

                    const response = await fetch(
                        `/api/leads/${leadId}`,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type":
                                    "application/json",
                            },
                            body: JSON.stringify({
                                status: newStatus,
                            }),
                        }
                    );

                    const data =
                        await response.json();

                    console.log(data);
                }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
            >
                <option value="New">New</option>
                <option value="Contacted">
                    Contacted
                </option>
                <option value="Qualified">
                    Qualified
                </option>
                <option value="Lost">Lost</option>
            </select>
        </div>
    );
}