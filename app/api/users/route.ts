import { NextRequest, NextResponse } from "next/server";
import { mockUsers } from "@/lib/mockUserStore";
import { logAction } from "@/lib/mockAuditLogStore";

export async function GET() {
  return NextResponse.json(mockUsers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newUser = {
    id: crypto.randomUUID(),
    name: body.name ?? body.email.split("@")[0],
    email: body.email,
    role: body.role ?? "author",
    lastActiveAt: new Date(0).toISOString(), // never active yet
  };
  mockUsers.push(newUser);
  logAction({ actorEmail: "admin@gmail.com", action: "invited user", target: body.email });
  return NextResponse.json(newUser);
}