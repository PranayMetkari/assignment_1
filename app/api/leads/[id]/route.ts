import { NextResponse } from "next/server";
import { leads } from "../../../../data/leads";

export async function PATCH(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    }
) {
    const { id } = await params;

    const body = await request.json();

    const lead = leads.find(
        (lead) => lead.id === id
    );

    if (!lead) {
        return NextResponse.json(
            { error: "Lead not found" },
            { status: 404 }
        );
    }

    lead.status = body.status;

    return NextResponse.json({
        success: true,
        lead,
    });
}