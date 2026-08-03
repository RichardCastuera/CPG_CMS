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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data, error } = await supabase
    .from("guideline_references")
    .select("sort_order, references(*)")
    .eq("guideline_id", id)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const attached = data.map((row: any) => ({
    id: row.references.id,
    label: row.references.label,
    citation: row.references.citation,
    order: row.sort_order,
  }));

  return NextResponse.json(attached);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const body = await req.json();

  let referenceId = body.referenceId;

  if (body.newReference) {
    const input = body.newReference;
    const { data: newRef, error: createError } = await supabase
      .from("references")
      .insert({
        label: buildLabel(input.authors, input.year),
        citation: buildCitation(input),
        doi_or_url: input.doiOrUrl || null,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }
    referenceId = newRef.id;
  }

  const { count } = await supabase
    .from("guideline_references")
    .select("*", { count: "exact", head: true })
    .eq("guideline_id", id);

  const { data, error } = await supabase
    .from("guideline_references")
    .insert({
      guideline_id: id,
      reference_id: referenceId,
      sort_order: count ?? 0,
    })
    .select("sort_order, references(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    id: (data as any).references.id,
    label: (data as any).references.label,
    citation: (data as any).references.citation,
    order: data.sort_order,
  });
}