export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO date
  actorEmail: string;
  action: string; // "published", "submitted for review", "edited section", "approved", "invited user"
  target: string; // "neonatal-sepsis v2.0", "asthma-exacerb v4.1 › Triage"
}