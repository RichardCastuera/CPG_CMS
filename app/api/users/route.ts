import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();
  return profile?.role === "admin";
}

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

  if (!(await requireAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Only admins can invite users" }, { status: 403 });
  }

  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(body.email, {
    data: { name: body.name ?? body.email.split("@")[0] },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.role && body.role !== "author") {
  await admin.rpc("set_initial_user_role", {
    p_user_id: data.user.id,
    p_role: body.role,
  });
}

  return NextResponse.json({ id: data.user.id });
}