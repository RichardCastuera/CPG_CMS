import { NextResponse } from "next/server";
import { mockAuditLog } from "@/lib/mockAuditLogStore";

export async function GET() {
  return NextResponse.json(mockAuditLog);
}