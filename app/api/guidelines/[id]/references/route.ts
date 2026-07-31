import { NextRequest, NextResponse } from "next/server";

const mockAttached: Record<string, any[]> = {};
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
  const body = await req.json();
  const existing = mockAttached[id] ?? [];

  // Case 1: attaching an existing reference by id (unchanged from before)
  if (body.referenceId) {
    const source = MOCK_LIBRARY[body.referenceId];
    if (!source) {
      return NextResponse.json({ error: "Unknown reference" }, { status: 400 });
    }
    const attached = {
      id: body.referenceId,
      label: source.label,
      citation: source.citation,
      order: existing.length + 1,
    };
    mockAttached[id] = [...existing, attached];
    return NextResponse.json(attached);
  }

  // Case 2: creating a brand-new reference, then attaching it immediately
  if (body.newReference) {
    const { authors, year, title, journal, volumeIssuePages, doiOrUrl } = body.newReference;

    // Derive a short display label similar to "Bradley 2011" —
    // takes the first author's surname (first word before a comma/space) + year.
    // TODO: this is a rough heuristic; refine or let the user override it once
    // a real citation-formatting library or backend service is in place.
    const firstAuthorSurname = authors.split(",")[0].split(" ")[0];
    const label = `${firstAuthorSurname} ${year}`;

    const citationParts = [
      authors,
      title,
      journal + (volumeIssuePages ? `. ${volumeIssuePages}` : ""),
      doiOrUrl,
    ].filter(Boolean);
    const citation = citationParts.join(". ") + ".";

    const newRefId = crypto.randomUUID();
    MOCK_LIBRARY[newRefId] = { label, citation }; // add to the searchable library too

    const attached = {
      id: newRefId,
      label,
      citation,
      order: existing.length + 1,
    };
    mockAttached[id] = [...existing, attached];
    return NextResponse.json(attached);
  }

  return NextResponse.json({ error: "Missing referenceId or newReference" }, { status: 400 });
}