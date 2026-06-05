import { leads } from "../../../data/leads";
import StatusSelector from "../../../components/StatusSelector";

export default async function LeadDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const lead = leads.find(
        (lead) => lead.id === id
    );

    if (!lead) {
        return (
            <div className="p-8">
                Lead not found
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-xl p-6">

                <h1 className="text-3xl font-bold mb-6">
                    {lead.name}
                </h1>

                <div className="space-y-4">

                    <p>
                        <span className="text-zinc-500">
                            Email:
                        </span>{" "}
                        {lead.email}
                    </p>

                    <p>
                        <span className="text-zinc-500">
                            Company:
                        </span>{" "}
                        {lead.company}
                    </p>

                    <StatusSelector
                        leadId={lead.id}
                        initialStatus={lead.status}
                    />

                    <p>
                        <span className="text-zinc-500">
                            Created:
                        </span>{" "}
                        {lead.createdAt}
                    </p>

                </div>

            </div>
        </div>
    );
}