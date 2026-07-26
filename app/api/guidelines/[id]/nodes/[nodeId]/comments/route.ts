import { NextRequest, NextResponse } from "next/server";

const mockComments: Record<string, any[]> = {};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  const { nodeId } = await params;
  return NextResponse.json(mockComments[nodeId] ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; nodeId: string }> }
) {
  const { nodeId } = await params;
  const { body } = await req.json();

  const comment = {
    id: crypto.randomUUID(),
    nodeId,
    authorName: "You", // TODO: replace with real authenticated user once auth exists
    authorInitials: "Y",
    body,
    createdAt: new Date().toISOString(),
    resolved: false,
  };

  mockComments[nodeId] = [...(mockComments[nodeId] ?? []), comment];
  return NextResponse.json(comment);
}