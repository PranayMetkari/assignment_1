import { describe, it, expect, beforeEach, vi } from "vitest";
import { Lead } from "../../types/lead";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}));


vi.mock("../../lib/store", () => ({
  getAllLeads: vi.fn(),
  createLead:  vi.fn(),
  emailExists: vi.fn(),
}));


import * as store from "../../lib/store";
import { GET, POST } from "../../app/api/leads/route";


const SAMPLE_LEADS: Lead[] = [
  { id: "1", name: "John Doe",    email: "john@example.com",  company: "Google", status: "New",       createdAt: "2025-06-01" },
  { id: "2", name: "Alice Smith", email: "alice@example.com", company: "Amazon", status: "Contacted", createdAt: "2025-06-02" },
];

function makePostRequest(body: Record<string, string>): Request {
  return new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}


const mockGetAllLeads = vi.mocked(store.getAllLeads);
const mockCreateLead  = vi.mocked(store.createLead);
const mockEmailExists = vi.mocked(store.emailExists);

beforeEach(() => vi.clearAllMocks());

// ── GET /api/leads ────────────────────────────────────────────────────────────
describe("GET /api/leads", () => {
  it("returns 200 with a leads array", async () => {
    mockGetAllLeads.mockResolvedValue(SAMPLE_LEADS);
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.leads)).toBe(true);
  });

  it("returns all leads from the store", async () => {
    mockGetAllLeads.mockResolvedValue(SAMPLE_LEADS);
    const res = await GET();
    const data = await res.json();
    expect(data.leads).toHaveLength(2);
    expect(data.leads[0].name).toBe("John Doe");
    expect(data.leads[1].name).toBe("Alice Smith");
  });

  it("returns an empty array when store is empty", async () => {
    mockGetAllLeads.mockResolvedValue([]);
    const res = await GET();
    const data = await res.json();
    expect(data.leads).toHaveLength(0);
  });
});

// ── POST /api/leads ───────────────────────────────────────────────────────────
describe("POST /api/leads", () => {

  it("creates a lead and returns 201 with success: true", async () => {
    const newLead: Lead = { id: "99", name: "Test", email: "test@co.com", company: "TestCo", status: "New", createdAt: "2025-06-01" };
    mockEmailExists.mockResolvedValue(false);
    mockCreateLead.mockResolvedValue(newLead);

    const res = await POST(makePostRequest({ name: "Test", email: "test@co.com", company: "TestCo" }));
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.lead).toMatchObject(newLead);
  });

  it("calls createLead with the correct values", async () => {
    mockEmailExists.mockResolvedValue(false);
    mockCreateLead.mockResolvedValue({ id: "1", name: "Jane", email: "jane@co.com", company: "Co", status: "New", createdAt: "2025-06-01" });

    await POST(makePostRequest({ name: "Jane", email: "jane@co.com", company: "Co" }));

    expect(mockCreateLead).toHaveBeenCalledWith({ name: "Jane", email: "jane@co.com", company: "Co" });
  });

  it("returns 400 when name is missing", async () => {
    const res = await POST(makePostRequest({ email: "x@x.com", company: "Co" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/name/i);
  });

  it("returns 400 when name is only whitespace", async () => {
    const res = await POST(makePostRequest({ name: "   ", email: "x@x.com", company: "Co" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makePostRequest({ name: "Jane", company: "Co" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/email/i);
  });

  it("returns 400 when company is missing", async () => {
    const res = await POST(makePostRequest({ name: "Jane", email: "jane@co.com" }));
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/company/i);
  });

  it("returns 400 for an invalid email format", async () => {
    const res = await POST(makePostRequest({ name: "Jane", email: "not-an-email", company: "Co" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for email missing @", async () => {
    const res = await POST(makePostRequest({ name: "Jane", email: "janeco.com", company: "Co" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when email already exists", async () => {
    mockEmailExists.mockResolvedValue(true);
    const res = await POST(makePostRequest({ name: "Jane", email: "existing@co.com", company: "Co" }));
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toMatch(/already exists/i);
  });

  it("does not call createLead when email is a duplicate", async () => {
    mockEmailExists.mockResolvedValue(true);
    await POST(makePostRequest({ name: "Jane", email: "existing@co.com", company: "Co" }));
    expect(mockCreateLead).not.toHaveBeenCalled();
  });
});