import { NextRequest, NextResponse } from "next/server";

// In-memory store just to unblock frontend development —
// replace with real DB + object storage (S3/Supabase storage/etc.) later
const mockArtifacts: Record<string, any[]> = {};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(mockArtifacts[id] ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Placeholder: real implementation uploads to storage and gets a persistent URL.
  // For now, using a local object URL substitute so the UI has something to render.
  const artifact = {
    id: crypto.randomUUID(),
    guidelineId: id,
    name: file.name,
    url: `/mock-uploads/${file.name}`, // TODO: replace with real storage URL
    thumbnailUrl: `/mock-uploads/${file.name}`,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    attachedToNodeIds: [],
  };

  mockArtifacts[id] = [...(mockArtifacts[id] ?? []), artifact];
  return NextResponse.json(artifact);
}