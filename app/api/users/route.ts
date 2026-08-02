
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function GET() {
  const supabase = createClient(await cookies());
  const { data: profiles, error } = await supabase.from("profiles").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const admin = createAdminClient();
  const enriched = await Promise.all(
    profiles.map(async (p) => {
      const { data } = await admin.auth.admin.getUserById(p.id);
      return {
        id: p.id,
        name: p.name,
        email: data.user?.email ?? "",
        role: p.role,
        lastActiveAt: data.user?.last_sign_in_at ?? p.created_at,
        status: data.user?.email_confirmed_at ? "active" : "invited",
      };
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, {
    data: { name: body.name ?? body.email.split("@")[0] },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.role && body.role !== "author") {
    await admin.from("profiles").update({ role: body.role }).eq("id", data.user.id);
  }

  return NextResponse.json({ id: data.user.id });
}