import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/set-password";

  if (code) {
    const supabase = createClient(await cookies());

    // Always clear any existing session first — an invite/recovery link
    // must never silently reuse whoever happens to already be logged in
    // on this browser.
    await supabase.auth.signOut();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=invalid_link`);
}