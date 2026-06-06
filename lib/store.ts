import fs from "fs";
import path from "path";
import { Lead, LeadStatus } from "../types/lead";

const DB_PATH = path.join(process.cwd(), "data", "leads.json");

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

function readDB(): Lead[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(SEED_LEADS);
      return [...SEED_LEADS];
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as Lead[];
  } catch {
    writeDB(SEED_LEADS);
    return [...SEED_LEADS];
  }
}

function writeDB(leads: Lead[]): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(leads, null, 2), "utf-8");
}


export function getAllLeads(): Lead[] {
  return readDB();
}

export function getLeadById(id: string): Lead | undefined {
  return readDB().find((l) => l.id === id);
}

export function createLead(data: {
  name: string;
  email: string;
  company: string;
}): Lead {
  const leads = readDB();

  const newLead: Lead = {
    id: String(Date.now()),
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company.trim(),
    status: "New" as LeadStatus,
    createdAt: new Date().toISOString().split("T")[0],
  };

  leads.unshift(newLead);
  writeDB(leads);
  return newLead;
}

export function updateLeadStatus(id: string, status: LeadStatus): Lead | null {
  const leads = readDB();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return null;

  lead.status = status;
  writeDB(leads);
  return lead;
}

export function emailExists(email: string): boolean {
  return readDB().some(
    (l) => l.email.toLowerCase() === email.trim().toLowerCase()
  );
}