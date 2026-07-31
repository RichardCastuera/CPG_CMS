import { NextRequest, NextResponse } from "next/server";
import { mockGuidelines } from "@/lib/mockGuidelineStore";
import { GuidelineWithVersions } from "@/constants";
import { logAction } from "@/lib/mockAuditLogStore";

export async function GET() {
  return NextResponse.json(Object.values(mockGuidelines));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = crypto.randomUUID();
  const versionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const guideline: GuidelineWithVersions = {
    id,
    title: body.title,
    short_title: body.short_title ?? null,
    guideline_type: body.guideline_type,
    specialty_tags: body.specialty_tags ?? [],
    societies: body.societies ?? [],
    authors: body.authors ?? [],
    doi: body.doi ?? null,
    status: body.status,
    current_version_id: versionId,
    next_review_date: body.next_review_date ?? null,
    created_at: now,
    updated_at: now,
    versions: [
      {
        id: versionId,
        guideline_id: id,
        version_number: body.version_number,
        status: mapGuidelineStatusToVersionStatus(body.status),
        changelog: null,
        effective_date: body.effective_date ?? null,
        source_pdf_url: null,
        created_by: null,
        created_at: now,
        published_at: body.status === "published" ? now : null,
      },
    ],
  };

  mockGuidelines[id] = guideline;
  logAction({
  actorEmail: "admin@gmail.com",
  action: "created guideline",
  target: guideline.title,
});
return NextResponse.json({ id });
}

function mapGuidelineStatusToVersionStatus(
  status: string
): "draft" | "in_review" | "published" | "superseded" {
  if (status === "archived") return "superseded";
  return status as "draft" | "in_review" | "published";
}