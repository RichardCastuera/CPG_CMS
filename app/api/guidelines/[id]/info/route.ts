import { NextRequest, NextResponse } from "next/server";
import { mockGuidelines } from "@/lib/mockGuidelineStore";
import { GuidelineWithVersions } from "@/constants";
import { logAction } from "@/lib/mockAuditLogStore";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const guideline = mockGuidelines[id];
  if (!guideline) {
    return NextResponse.json({ error: "Guideline not found" }, { status: 404 });
  }
  return NextResponse.json(guideline);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: GuidelineWithVersions = await req.json();
  const previousStatus = mockGuidelines[id]?.status;
  mockGuidelines[id] = { ...body, updated_at: new Date().toISOString() };

  // Only log meaningful status transitions, not every autosave tick —
  // otherwise the audit log would fill with noise from every debounced save.
  if (previousStatus && previousStatus !== body.status) {
    const actionLabel =
      body.status === "in_review" ? "submitted for review"
      : body.status === "published" ? "published"
      : body.status === "archived" ? "archived"
      : "updated";
    logAction({
      actorEmail: "admin@gmail.com",
      action: actionLabel,
      target: `${body.title} ${body.versions.find((v) => v.id === body.current_version_id)?.version_number ?? ""}`.trim(),
    });
  }

  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}