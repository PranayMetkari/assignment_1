import { NextResponse } from "next/server";
import { updateLeadStatus } from "../../../../lib/store";
import { LeadStatus } from "../../../../types/lead";

const VALID_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const lead = await updateLeadStatus(id, status as LeadStatus);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}