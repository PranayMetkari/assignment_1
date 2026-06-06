"use client";

import { useEffect, useMemo, useState } from "react";
import LeadCard from "../components/LeadCard";
import Modal from "../components/Modal";
import { Lead, LeadStatus, SortDirection, SortField } from "../types/lead";

function CardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded bg-zinc-800" />
            <div className="h-3 w-36 rounded bg-zinc-800/70" />
          </div>
        </div>
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
      </div>
      <div className="border-t border-zinc-800" />
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-zinc-800/70" />
        <div className="h-3 w-32 rounded bg-zinc-800/70" />
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
const STAT_CONFIG: Record<
  LeadStatus,
  { label: string; numColor: string; activeBorder: string }
> = {
  New:       { label: "New",       numColor: "text-yellow-400",  activeBorder: "border-yellow-500" },
  Contacted: { label: "Contacted", numColor: "text-blue-400",    activeBorder: "border-blue-500"   },
  Qualified: { label: "Qualified", numColor: "text-emerald-400", activeBorder: "border-emerald-500"},
  Lost:      { label: "Lost",      numColor: "text-red-400",     activeBorder: "border-red-500"    },
};

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showModal, setShowModal] = useState(false);


  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  // ── Fetch leads ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/leads", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Server error");
        return r.json();
      })
      .then((d) => setLeads(d.leads))
      .catch(() => setFetchError("Failed to load leads. Please refresh."))
      .finally(() => setLoading(false));
  }, []);


  const counts = useMemo(
    () => ({
      New:       leads.filter((l) => l.status === "New").length,
      Contacted: leads.filter((l) => l.status === "Contacted").length,
      Qualified: leads.filter((l) => l.status === "Qualified").length,
      Lost:      leads.filter((l) => l.status === "Lost").length,
    }),
    [leads]
  );

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    return leads
      .filter((l) => {
        const matchSearch =
          !q ||
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q);
        const matchStatus = statusFilter === "All" || l.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        const cmp = a[sortField].localeCompare(b[sortField]);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [leads, search, statusFilter, sortField, sortDir]);

  // ── Toggle stat card filter ────────────────────────────────────────────────
  const toggleStatus = (s: LeadStatus) => {
    setStatusFilter((prev) => (prev === s ? "All" : s));
  };

  // ── Sort helper ────────────────────────────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // ── Create lead ────────────────────────────────────────────────────────────
  const handleCreateLead = async () => {
    setFormError("");
    setFormSuccess("");

    if (!name.trim()) { setFormError("Name is required"); return; }
    if (!email.trim()) { setFormError("Email is required"); return; }
    if (!company.trim()) { setFormError("Company is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      const data = await res.json();

      if (data.success) {
        setLeads((prev) => [data.lead, ...prev]);
        setFormSuccess("Lead created!");
        setName(""); setEmail(""); setCompany("");
        setTimeout(() => { setShowModal(false); setFormSuccess(""); }, 1500);
      } else {
        setFormError(data.error ?? "Failed to create lead");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setFormError(""); setFormSuccess("");
    setName(""); setEmail(""); setCompany("");
    setShowModal(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Leads Dashboard</h1>
            <p className="text-zinc-500 mt-1 text-sm">Track and manage your sales pipeline</p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {(["New", "Contacted", "Qualified", "Lost"] as LeadStatus[]).map((s) => {
            const cfg = STAT_CONFIG[s];
            const active = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`rounded-xl p-4 text-left border transition-all duration-150
                  bg-zinc-900 hover:bg-zinc-800
                  ${active ? cfg.activeBorder : "border-zinc-800"}`}
              >
                <p className="text-zinc-500 text-sm">{cfg.label}</p>
                <p className={`text-4xl font-bold mt-1 tabular-nums ${cfg.numColor}`}>
                  {counts[s]}
                </p>
                {active && (
                  <p className="text-xs text-zinc-600 mt-1">click to clear</p>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">

          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email or company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 text-sm placeholder-zinc-600"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "All")}
            className="w-full md:w-44 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 text-sm text-zinc-300"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortField}-${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split("-");
              setSortField(f as SortField);
              setSortDir(d as SortDirection);
            }}
            className="w-full md:w-52 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 text-sm text-zinc-300"
          >
            <option value="createdAt-desc">Newest first</option>
            <option value="createdAt-asc">Oldest first</option>
            <option value="name-asc">Name A → Z</option>
            <option value="name-desc">Name Z → A</option>
            <option value="company-asc">Company A → Z</option>
          </select>
        </div>

        {/* ── Active filter row ── */}
        <div className="flex items-center justify-between mb-6 h-6">
          <p className="text-sm text-zinc-500">
            Showing{" "}
            <span className="text-zinc-300 font-medium">
              {loading ? "…" : filteredLeads.length}
            </span>{" "}
            {statusFilter !== "All" && (
              <>· filtered by <span className="text-zinc-300">{statusFilter}</span></>
            )}
          </p>
          {(statusFilter !== "All" || search) && (
            <button
              onClick={() => { setStatusFilter("All"); setSearch(""); }}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* ── Error state ── */}
        {fetchError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/20 border border-red-700/40 text-red-400 text-sm mb-6">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fetchError}
          </div>
        )}

        {/* ── Loading state ── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !fetchError && filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-zinc-800 rounded-2xl bg-zinc-900/30">
            <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-300">No leads found</h2>
            <p className="text-sm text-zinc-600 mt-1">
              {search || statusFilter !== "All"
                ? "Try adjusting your search or filter"
                : "Get started by adding your first lead"}
            </p>
            {(search || statusFilter !== "All") && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("All"); }}
                className="mt-4 px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ── Leads grid ── */}
        {!loading && !fetchError && filteredLeads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}

      </div>

      {/* ── Add Lead Modal ── */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Add New Lead</h2>
          <p className="text-sm text-zinc-500 mb-6">Fill in the details below to create a lead.</p>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-emerald-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {formSuccess}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="f-name" className="block mb-1.5 text-sm text-zinc-400">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="f-name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none text-sm placeholder-zinc-600"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="f-email" className="block mb-1.5 text-sm text-zinc-400">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="f-email"
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none text-sm placeholder-zinc-600"
              />
            </div>

            {/* Company */}
            <div>
              <label htmlFor="f-company" className="block mb-1.5 text-sm text-zinc-400">
                Company <span className="text-red-400">*</span>
              </label>
              <input
                id="f-company"
                type="text"
                placeholder="Acme Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-blue-500 focus:outline-none text-sm placeholder-zinc-600"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLead}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Creating…
                  </>
                ) : "Create Lead"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </main>
  );
}