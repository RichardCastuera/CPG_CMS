import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "archive_retention_years")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ years: data.value });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient(await cookies());
  const body = await req.json(); // { years: number }

  const { error } = await supabase
    .from("app_settings")
    .update({ value: body.years, updated_at: new Date().toISOString() })
    .eq("key", "archive_retention_years");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}