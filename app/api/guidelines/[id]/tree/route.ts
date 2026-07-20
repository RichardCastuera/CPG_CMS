import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  console.log(`[autosave] guideline ${id}:`, JSON.stringify(body).slice(0, 200));
  return NextResponse.json({ ok: true, savedAt: new Date().toISOString() });
}