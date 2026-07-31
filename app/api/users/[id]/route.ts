import { NextRequest, NextResponse } from "next/server";
import { mockUsers } from "@/lib/mockUserStore";
import { logAction } from "@/lib/mockAuditLogStore";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const user = mockUsers.find((u) => u.id === id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const previousRole = user.role;
  if (body.role) user.role = body.role;

  if (body.role && body.role !== previousRole) {
    logAction({
      actorEmail: "admin@gmail.com", // TODO: real actor once auth exists
      action: `changed role to ${body.role}`,
      target: user.email,
    });
  }

  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [removed] = mockUsers.splice(index, 1);
  logAction({
    actorEmail: "admin@gmail.com",
    action: "removed user",
    target: removed.email,
  });

  return NextResponse.json({ ok: true });
}