import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; referenceId: string }> }
) {
  const { id, referenceId } = await params;
  // TODO: real DB delete — mock store lives in the sibling route file for now,
  // so this stub just confirms the request shape; wire to shared storage once real DB exists
  return NextResponse.json({ ok: true, id, referenceId });
}