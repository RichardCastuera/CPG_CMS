import { NextRequest, NextResponse } from "next/server";
import { mockGuidelines } from "@/lib/mockGuidelineStore";
import { logAction } from "@/lib/mockAuditLogStore";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const title = mockGuidelines[id]?.title;
  delete mockGuidelines[id];
  if (title) {
    logAction({ actorEmail: "admin@gmail.com", action: "deleted guideline", target: title });
  }
  return NextResponse.json({ ok: true });
}