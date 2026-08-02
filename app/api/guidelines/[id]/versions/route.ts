import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json(); // { sourceVersionId: string, versionNumber: string }
  const supabase = createClient(await cookies());

  const { data: newVersionId, error } = await supabase.rpc(
    "duplicate_guideline_version",
    {
      p_source_version_id: body.sourceVersionId,
      p_new_version_number: body.versionNumber,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: newVersionId });
}