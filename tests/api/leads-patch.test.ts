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
  updateLeadStatus: vi.fn(),
}));

import * as store from "../../lib/store";
import { PATCH } from "../../app/api/leads/[id]/route";

const mockUpdateLeadStatus = vi.mocked(store.updateLeadStatus);

const SAMPLE_LEAD: Lead = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  company: "Google",
  status: "New",
  createdAt: "2025-06-01",
};

function makeRequest(body: Record<string, string>): Request {
  return new Request("http://localhost/api/leads/1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => vi.clearAllMocks());

describe("PATCH /api/leads/[id]", () => {

  it("returns 200 with success: true when status is updated", async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ...SAMPLE_LEAD, status: "Contacted" });
    const res = await PATCH(makeRequest({ status: "Contacted" }), makeParams("1"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.lead.status).toBe("Contacted");
  });

  it("returns the full updated lead object in response", async () => {
    const updated: Lead = { ...SAMPLE_LEAD, status: "Qualified" };
    mockUpdateLeadStatus.mockResolvedValue(updated);
    const res = await PATCH(makeRequest({ status: "Qualified" }), makeParams("1"));
    const data = await res.json();
    expect(data.lead).toMatchObject(updated);
  });

  it("can update to New", async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ...SAMPLE_LEAD, status: "New" });
    const res = await PATCH(makeRequest({ status: "New" }), makeParams("1"));
    expect(res.status).toBe(200);
  });

  it("can update to Contacted", async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ...SAMPLE_LEAD, status: "Contacted" });
    const res = await PATCH(makeRequest({ status: "Contacted" }), makeParams("1"));
    expect(res.status).toBe(200);
  });

  it("can update to Qualified", async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ...SAMPLE_LEAD, status: "Qualified" });
    const res = await PATCH(makeRequest({ status: "Qualified" }), makeParams("1"));
    expect(res.status).toBe(200);
  });

  it("can update to Lost", async () => {
    mockUpdateLeadStatus.mockResolvedValue({ ...SAMPLE_LEAD, status: "Lost" });
    const res = await PATCH(makeRequest({ status: "Lost" }), makeParams("1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 when lead does not exist", async () => {
    mockUpdateLeadStatus.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ status: "Contacted" }), makeParams("999"));
    const data = await res.json();
    expect(res.status).toBe(404);
    expect(data.error).toMatch(/not found/i);
  });

  it("returns 400 for an invalid status value", async () => {
    const res = await PATCH(makeRequest({ status: "InvalidStatus" }), makeParams("1"));
    expect(res.status).toBe(400);
  });

  it("returns 400 when status is missing from body", async () => {
    const res = await PATCH(makeRequest({}), makeParams("1"));
    expect(res.status).toBe(400);
  });

  it("does not call updateLeadStatus for an invalid status", async () => {
    await PATCH(makeRequest({ status: "BadStatus" }), makeParams("1"));
    expect(mockUpdateLeadStatus).not.toHaveBeenCalled();
  });

  it("error message lists the valid statuses", async () => {
    const res = await PATCH(makeRequest({ status: "WrongStatus" }), makeParams("1"));
    const data = await res.json();
    expect(data.error).toMatch(/New|Contacted|Qualified|Lost/);
  });
});