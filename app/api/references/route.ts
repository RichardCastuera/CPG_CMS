import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

function buildLabel(authors: string, year: string): string {
  const firstAuthorSurname = authors.split(",")[0]?.trim().split(" ")[0] ?? authors;
  return `${firstAuthorSurname} ${year}`;
}

function buildCitation(input: {
  authors: string;
  year: string;
  title?: string;
  journal: string;
  volumeIssuePages: string;
}): string {
  const parts = [
    input.authors,
    input.title ? `${input.title}.` : null,
    `${input.journal}.`,
    input.volumeIssuePages,
  ].filter(Boolean);
  return parts.join(" ");
}

export async function GET() {
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("references")
    .select("*, guideline_references(guideline_id, guidelines(title))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const enriched = data.map((r: any) => ({
    id: r.id,
    label: r.label,
    citation: r.citation,
    doi_or_url: r.doi_or_url,
    created_at: r.created_at,
    citedIn: (r.guideline_references ?? [])
      .map((gr: any) => gr.guidelines?.title)
      .filter(Boolean),
  }));

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const input = await req.json();

  const { data, error } = await supabase
    .from("references")
    .insert({
      label: buildLabel(input.authors, input.year),
      citation: buildCitation(input),
      doi_or_url: input.doiOrUrl || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { ids }: { ids: string[] } = await req.json();

  if (!ids?.length) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  // Block deletion of any reference that's still cited in a guideline.
  const { data: citedLinks, error: citedError } = await supabase
    .from("guideline_references")
    .select("reference_id, references(label), guidelines(title)")
    .in("reference_id", ids);

  if (citedError) {
    return NextResponse.json({ error: citedError.message }, { status: 400 });
  }

  if (citedLinks && citedLinks.length > 0) {
    const blocked = Array.from(
      new Map(
        citedLinks.map((link: any) => [
          link.reference_id,
          {
            id: link.reference_id,
            label: link.references?.label ?? link.reference_id,
            citedIn: citedLinks
              .filter((l: any) => l.reference_id === link.reference_id)
              .map((l: any) => l.guidelines?.title)
              .filter(Boolean),
          },
        ])
      ).values()
    );

    return NextResponse.json(
      {
        error: `${blocked.length} reference${
          blocked.length > 1 ? "s are" : " is"
        } still cited in a guideline and can't be deleted.`,
        blocked,
      },
      { status: 409 }
    );
  }

  const { error, count } = await supabase
    .from("references")
    .delete({ count: "exact" })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ deleted: count ?? ids.length });
}