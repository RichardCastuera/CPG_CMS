import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAction } from "@/lib/auditLogWriter";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: targetProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !targetProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const previousRole = targetProfile.role;

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ role: body.role })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.role && body.role !== previousRole) {
    const admin = createAdminClient();
    const { data: authUser } = await admin.auth.admin.getUserById(id);
    await logAction({
      actorId: user.id,
      action: `changed role to ${body.role}`,
      target: authUser.user?.email ?? id,
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(id);
  const targetEmail = authUser.user?.email ?? id;

  // Deletes the auth.users row; the profiles row cascades via its FK
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAction({
    actorId: user.id,
    action: "removed user",
    target: targetEmail,
  });

  return NextResponse.json({ ok: true });
}