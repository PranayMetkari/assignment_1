import { leads } from "../data/leads";
import { Lead } from "../types/lead";

export const getLeads = async (): Promise<Lead[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(leads);
    }, 1000);
  });
};