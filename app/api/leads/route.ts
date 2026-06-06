import { NextResponse } from "next/server";
import { getAllLeads, createLead, emailExists } from "../../../lib/store";

export async function GET() {
  return NextResponse.json({ leads: getAllLeads() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company } = body;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!company?.trim()) {
      return NextResponse.json({ error: "Company is required" }, { status: 400 });
    }
    if (emailExists(email)) {
      return NextResponse.json(
        { error: "A lead with this email already exists" },
        { status: 409 }
      );
    }

    const lead = createLead({ name, email, company });
    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}