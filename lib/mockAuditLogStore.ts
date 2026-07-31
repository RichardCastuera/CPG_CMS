import { AuditLogEntry } from "./auditlog";


export const mockAuditLog: AuditLogEntry[] = [
  { id: "a1", timestamp: "2026-07-08T09:12:00Z", actorEmail: "admin@gmail.com", action: "published", target: "neonatal-sepsis v2.0" },
  { id: "a2", timestamp: "2026-07-08T08:47:00Z", actorEmail: "sara.lin@cpg.org", action: "submitted for review", target: "peds-cap v3.0" },
  { id: "a3", timestamp: "2026-07-07T17:30:00Z", actorEmail: "j.alvarez@cpg.org", action: "edited section", target: "asthma-exacerb v4.1 › Triage" },
  { id: "a4", timestamp: "2026-07-07T14:05:00Z", actorEmail: "m.okafor@cpg.org", action: "approved", target: "peds-uti v2.0" },
  { id: "a5", timestamp: "2026-07-07T10:22:00Z", actorEmail: "admin@gmail.com", action: "invited user", target: "j.alvarez@cpg.org" },
];

// Real usage later: every mutation across the app (publish, comment, section edit,
// user invite, etc.) should push an entry here — this becomes the audit trail's
// single write path once wired to a real DB.
export function logAction(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  mockAuditLog.unshift({
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  });
}