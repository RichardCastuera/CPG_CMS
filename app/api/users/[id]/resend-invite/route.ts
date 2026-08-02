import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: targetUser, error: fetchError } =
    await admin.auth.admin.getUserById(id);

  if (fetchError || !targetUser.user?.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser.user.email_confirmed_at) {
    return NextResponse.json(
      { error: "This user has already accepted their invite" },
      { status: 400 }
    );
  }

  const email = targetUser.user.email;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single();

  const { error: deleteError } = await admin.auth.admin.deleteUser(id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  const { data: newUser, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  if (existingProfile?.role && newUser.user) {
    await supabase
      .from("profiles")
      .update({ role: existingProfile.role })
      .eq("id", newUser.user.id);
  }

  return NextResponse.json({ ok: true });
}