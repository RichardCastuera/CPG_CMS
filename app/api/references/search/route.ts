import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const supabase = createClient(await cookies());

    const { data, error } = await supabase
        .from("references")
        .select("*")
        .or(`label.ilike.%${q}%,citation.ilike.%${q}%`)
        .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
}