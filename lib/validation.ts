import { LeadFormData } from "../types/lead";

export interface ValidationError {
  field: keyof LeadFormData;
  message: string;
}

export function validateLeadForm(data: LeadFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name.trim()) {
    errors.push({ field: "name", message: "Name is required" });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: "name", message: "Name must be at least 2 characters" });
  }

  if (!data.email.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  if (!data.company.trim()) {
    errors.push({ field: "company", message: "Company is required" });
  }

  return errors;
}