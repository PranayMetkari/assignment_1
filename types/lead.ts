export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Lost";

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