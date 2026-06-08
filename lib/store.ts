/**
 * store.ts — Upstash Redis
 *
 * Works locally and on Vercel deployment.
 *
 * Setup:
 *  1. Vercel Dashboard → Storage → Upstash → Redis → Create → Connect to Project
 *  2. npm install @upstash/redis
 *  3. vercel env pull .env.local
 */

import { Redis } from "@upstash/redis";
import { Lead, LeadStatus } from "../types/lead";

const LEADS_KEY = "leads";

const SEED_LEADS: Lead[] = [
  { id: "1",  name: "John Doe",          email: "john@example.com",       company: "Google",     status: "New",       createdAt: "2025-06-01" },
  { id: "2",  name: "Alice Smith",       email: "alice@example.com",      company: "Amazon",     status: "Contacted", createdAt: "2025-06-02" },
  { id: "3",  name: "Bob Johnson",       email: "bob@example.com",        company: "Microsoft",  status: "Qualified", createdAt: "2025-06-03" },
  { id: "4",  name: "Emma Wilson",       email: "emma@example.com",       company: "Netflix",    status: "Lost",      createdAt: "2025-06-04" },
  { id: "5",  name: "David Brown",       email: "david@example.com",      company: "Adobe",      status: "New",       createdAt: "2025-06-05" },
  { id: "6",  name: "Sophia Miller",     email: "sophia@example.com",     company: "Spotify",    status: "Qualified", createdAt: "2025-06-06" },
  { id: "7",  name: "James Wilson",      email: "james@example.com",      company: "Tesla",      status: "Contacted", createdAt: "2025-06-07" },
  { id: "8",  name: "Olivia Taylor",     email: "olivia@example.com",     company: "Meta",       status: "Lost",      createdAt: "2025-06-08" },
  { id: "9",  name: "Michael Johnson",   email: "michael@example.com",    company: "Apple",      status: "Qualified", createdAt: "2025-06-09" },
  { id: "10", name: "Emma Davis",        email: "emma.davis@example.com", company: "Netflix",    status: "Contacted", createdAt: "2025-06-10" },
  { id: "11", name: "Daniel Garcia",     email: "daniel@example.com",     company: "Oracle",     status: "New",       createdAt: "2025-06-11" },
  { id: "12", name: "Isabella Martinez", email: "isabella@example.com",   company: "Salesforce", status: "Lost",      createdAt: "2025-06-12" },
];

// ── Redis client ──────────────────────────────────────────────────────────────
// fromEnv() automatically reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = Redis.fromEnv();

// ── Private helpers ───────────────────────────────────────────────────────────

async function readDB(): Promise<Lead[]> {
  try {
    const leads = await redis.get<Lead[]>(LEADS_KEY);

    if (!leads) {
      // First run — seed Redis with initial data
      await redis.set(LEADS_KEY, SEED_LEADS);
      return [...SEED_LEADS];
    }

    return leads;
  } catch (err) {
    console.error("Redis read error:", err);
    throw new Error("Failed to read leads from store");
  }
}

async function writeDB(leads: Lead[]): Promise<void> {
  try {
    await redis.set(LEADS_KEY, leads);
  } catch (err) {
    console.error("Redis write error:", err);
    throw new Error("Failed to save leads to store");
  }
}

// ── Public store API ──────────────────────────────────────────────────────────

export async function getAllLeads(): Promise<Lead[]> {
  return readDB();
}

export async function getLeadById(id: string): Promise<Lead | undefined> {
  const leads = await readDB();
  return leads.find((l) => l.id === id);
}

export async function createLead(data: {
  name: string;
  email: string;
  company: string;
}): Promise<Lead> {
  const leads = await readDB();

  const newLead: Lead = {
    id:        String(Date.now()),
    name:      data.name.trim(),
    email:     data.email.trim().toLowerCase(),
    company:   data.company.trim(),
    status:    "New" as LeadStatus,
    createdAt: new Date().toISOString().split("T")[0],
  };

  leads.unshift(newLead);
  await writeDB(leads);
  return newLead;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<Lead | null> {
  const leads = await readDB();
  const lead  = leads.find((l) => l.id === id);
  if (!lead) return null;

  lead.status = status;
  await writeDB(leads);
  return lead;
}

export async function emailExists(email: string): Promise<boolean> {
  const leads = await readDB();
  return leads.some(
    (l) => l.email.toLowerCase() === email.trim().toLowerCase()
  );
}