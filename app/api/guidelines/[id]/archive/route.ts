import { NextRequest, NextResponse } from "next/server";
import { mockGuidelines } from "@/lib/mockGuidelineStore";
import { logAction } from "@/lib/mockAuditLogStore";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (mockGuidelines[id]) {
    mockGuidelines[id].status = "archived";
    logAction({
      actorEmail: "admin@gmail.com",
      action: "archived",
      target: mockGuidelines[id].title,
    });
  }
  return NextResponse.json({ ok: true });
}