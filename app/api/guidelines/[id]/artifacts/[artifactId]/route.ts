import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const { artifactId } = await params;
  const { caption } = await req.json();
  // TODO: real DB update — returning a shape the client can merge in optimistically
  return NextResponse.json({ id: artifactId, caption });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; artifactId: string }> }
) {
  const { artifactId } = await params;
  return NextResponse.json({ ok: true, id: artifactId });
}