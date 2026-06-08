import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import os from "os";

let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "leads-test-"));
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);
});

afterAll(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});


beforeEach(() => {
  const dataDir = path.join(tmpDir, "data");
  if (fs.existsSync(dataDir)) {
    fs.rmSync(dataDir, { recursive: true });
  }
  vi.resetModules(); 
});

// Import store fresh after each resetModules
async function store() {
  return import("../../lib/store");
}

// ── getAllLeads ────────────────────────────────────────────────────────────────
describe("getAllLeads()", () => {
  it("returns seed data on first run when no JSON file exists", async () => {
    const { getAllLeads } = await store();
    const leads = await getAllLeads();
    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBeGreaterThan(0);
  });

  it("returns lead objects with all required fields", async () => {
    const { getAllLeads } = await store();
    const leads = await getAllLeads();
    for (const lead of leads) {
      expect(lead).toHaveProperty("id");
      expect(lead).toHaveProperty("name");
      expect(lead).toHaveProperty("email");
      expect(lead).toHaveProperty("company");
      expect(lead).toHaveProperty("status");
      expect(lead).toHaveProperty("createdAt");
    }
  });

  it("creates leads.json file on first call", async () => {
    const { getAllLeads } = await store();
    await getAllLeads();
    const dbPath = path.join(tmpDir, "data", "leads.json");
    expect(fs.existsSync(dbPath)).toBe(true);
  });

  it("returns same count on consecutive calls", async () => {
    const { getAllLeads } = await store();
    const first = await getAllLeads();
    const second = await getAllLeads();
    expect(second.length).toBe(first.length);
  });
});

// ── getLeadById ───────────────────────────────────────────────────────────────
describe("getLeadById()", () => {
  it("returns the correct lead for a valid id", async () => {
    const { getLeadById } = await store();
    const lead = await getLeadById("1");
    expect(lead).toBeDefined();
    expect(lead?.id).toBe("1");
    expect(lead?.name).toBe("John Doe");
  });

  it("returns undefined for a non-existent id", async () => {
    const { getLeadById } = await store();
    expect(await getLeadById("999")).toBeUndefined();
  });

  it("returns undefined for an empty string id", async () => {
    const { getLeadById } = await store();
    expect(await getLeadById("")).toBeUndefined();
  });
});

// ── createLead ────────────────────────────────────────────────────────────────
describe("createLead()", () => {
  it("creates a new lead and returns it", async () => {
    const { createLead } = await store();
    const lead = await createLead({ name: "Test User", email: "test@example.com", company: "TestCo" });
    expect(lead.id).toBeDefined();
    expect(lead.name).toBe("Test User");
    expect(lead.email).toBe("test@example.com");
    expect(lead.company).toBe("TestCo");
    expect(lead.status).toBe("New");
    expect(lead.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("new lead appears at the top of the list", async () => {
    const { createLead, getAllLeads } = await store();
    const lead = await createLead({ name: "First", email: "first@example.com", company: "Co" });
    const leads = await getAllLeads();
    expect(leads[0].id).toBe(lead.id);
  });

  it("persists the new lead across reads", async () => {
    const { createLead, getLeadById } = await store();
    const created = await createLead({ name: "Persist", email: "persist@example.com", company: "Co" });
    const found = await getLeadById(created.id);
    expect(found?.email).toBe("persist@example.com");
  });

  it("trims whitespace from name, email, company", async () => {
    const { createLead } = await store();
    const lead = await createLead({ name: "  Jane  ", email: "  jane@co.com  ", company: "  Co  " });
    expect(lead.name).toBe("Jane");
    expect(lead.email).toBe("jane@co.com");
    expect(lead.company).toBe("Co");
  });

  it("lowercases the email", async () => {
    const { createLead } = await store();
    const lead = await createLead({ name: "Test", email: "UPPER@EXAMPLE.COM", company: "Co" });
    expect(lead.email).toBe("upper@example.com");
  });

  it("always sets status to New", async () => {
    const { createLead } = await store();
    const lead = await createLead({ name: "Test", email: "s@example.com", company: "Co" });
    expect(lead.status).toBe("New");
  });

  it("increments the total leads count by 1", async () => {
    const { createLead, getAllLeads } = await store();
    const before = (await getAllLeads()).length;
    await createLead({ name: "X", email: "x@x.com", company: "X" });
    const after = (await getAllLeads()).length;
    expect(after).toBe(before + 1);
  });
});

// ── updateLeadStatus ──────────────────────────────────────────────────────────
describe("updateLeadStatus()", () => {
  it("updates the status of an existing lead", async () => {
    const { updateLeadStatus } = await store();
    const updated = await updateLeadStatus("1", "Contacted");
    expect(updated?.status).toBe("Contacted");
  });

  it("persists the status change on re-read", async () => {
    const { updateLeadStatus, getLeadById } = await store();
    await updateLeadStatus("2", "Qualified");
    const lead = await getLeadById("2");
    expect(lead?.status).toBe("Qualified");
  });

  it("can update to all four valid statuses", async () => {
    const { updateLeadStatus } = await store();
    for (const status of ["New", "Contacted", "Qualified", "Lost"] as const) {
      const result = await updateLeadStatus("3", status);
      expect(result?.status).toBe(status);
    }
  });

  it("returns null for a non-existent lead id", async () => {
    const { updateLeadStatus } = await store();
    expect(await updateLeadStatus("999", "Lost")).toBeNull();
  });

  it("does not affect other leads when updating one", async () => {
    const { updateLeadStatus, getLeadById } = await store();
    const before = await getLeadById("2");
    await updateLeadStatus("1", "Lost");
    const after = await getLeadById("2");
    expect(after?.status).toBe(before?.status);
  });
});

// ── emailExists ───────────────────────────────────────────────────────────────
describe("emailExists()", () => {
  it("returns true for an email in seed data", async () => {
    const { emailExists } = await store();
    expect(await emailExists("john@example.com")).toBe(true);
  });

  it("returns false for an email that does not exist", async () => {
    const { emailExists } = await store();
    expect(await emailExists("nobody@nowhere.com")).toBe(false);
  });

  it("is case-insensitive", async () => {
    const { emailExists } = await store();
    expect(await emailExists("JOHN@EXAMPLE.COM")).toBe(true);
  });

  it("trims whitespace before checking", async () => {
    const { emailExists } = await store();
    expect(await emailExists("  john@example.com  ")).toBe(true);
  });

  it("returns true immediately after a lead is created", async () => {
    const { createLead, emailExists } = await store();
    await createLead({ name: "New", email: "brand-new@example.com", company: "Co" });
    expect(await emailExists("brand-new@example.com")).toBe(true);
  });
});