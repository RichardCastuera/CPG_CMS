import { NextRequest, NextResponse } from "next/server";

// In-memory mock store, keyed by guidelineId
const mockAttached: Record<string, { id: string; label: string; citation: string; order: number }[]> = {};

// Pretend citation database to attach from
const MOCK_LIBRARY: Record<string, { label: string; citation: string }> = {
  "ref-bradley-2011": {
    label: "Bradley 2011",
    citation: "Bradley JS, et al. Clin Infect Dis. 2011;53(7):e25-76.",
  },
  "ref-neuman-2011": {
    label: "Neuman 2011",
    citation: "Neuman MI, et al. Pediatrics. 2011;128(2):246-53.",
  },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(mockAttached[id] ?? []);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { referenceId } = await req.json();

  const source = MOCK_LIBRARY[referenceId];
  if (!source) {
    return NextResponse.json({ error: "Unknown reference" }, { status: 400 });
  }

  const existing = mockAttached[id] ?? [];
  const attached = {
    id: referenceId,
    label: source.label,
    citation: source.citation,
    order: existing.length + 1,
  };

  mockAttached[id] = [...existing, attached];
  return NextResponse.json(attached);
}