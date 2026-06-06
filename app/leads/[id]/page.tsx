import { getLeadById } from "../../../lib/store";
import StatusSelector from "../../../components/StatusSelector";
import StatusBadge from "../../../components/StatusBadge";
import Link from "next/link";

// Force this page to always re-render on every request (no caching)
export const dynamic = "force-dynamic";

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

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-pink-500 to-fuchsia-600",
];

function avatarGradient(name: string): string {
  const i =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) %
    AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[i];
}

export default async function LeadDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = getLeadById(id);

  if (!lead) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold">Lead not found</h1>
          <p className="text-zinc-500">This lead does not exist or was deleted.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const gradient = avatarGradient(lead.name);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <span className="text-xs text-zinc-600">Lead #{lead.id}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}
            >
              {getInitials(lead.name)}
            </div>
            <h1 className="text-xl font-bold text-white">{lead.name}</h1>
            <p className="text-zinc-400 text-sm mt-1">{lead.company}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Contact Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-zinc-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm text-blue-400 hover:text-blue-300 break-all">
                    {lead.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-zinc-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Company</p>
                  <p className="text-sm text-zinc-300">{lead.company}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-zinc-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Added</p>
                  <p className="text-sm text-zinc-300">{formatDate(lead.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Pipeline Stage</h2>
            <StatusSelector leadId={lead.id} initialStatus={lead.status} />
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-300 mb-4">Lead Details</h2>
            <div className="divide-y divide-zinc-800">
              {[
                { label: "Full Name", value: lead.name },
                { label: "Email",     value: lead.email },
                { label: "Company",   value: lead.company },
                { label: "Status",    value: <StatusBadge status={lead.status} /> },
                { label: "Lead ID",   value: `#${lead.id}` },
                { label: "Created",   value: formatDate(lead.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-zinc-500 w-28 flex-shrink-0">{label}</span>
                  <span className="text-zinc-300 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}