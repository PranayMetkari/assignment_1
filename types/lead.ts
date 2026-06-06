export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: LeadStatus;
  createdAt: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  company: string;
}

export type SortField = "createdAt" | "name" | "company";
export type SortDirection = "asc" | "desc";