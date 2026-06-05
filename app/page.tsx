"use client";
import LeadCard from "../components/LeadCard";
import { useEffect, useState } from "react";
import { getLeads } from "../lib/mockApi";
import { Lead } from "../types/lead";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  
  useEffect(() => {
    const fetchLeads = async () => {
      const data = await getLeads();
      setLeads(data);
      setLoading(false);
    };

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <h1>Loading...</h1>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Leads Dashboard
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search leads by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-zinc-200">
            No leads found
          </h2>

          <p className="text-zinc-500 mt-2">
            Try a different search or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
            />  
          ))}
        </div>
      )}
    </main>
  );
}