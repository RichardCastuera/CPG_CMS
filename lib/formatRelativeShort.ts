export function formatRelativeShort(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "now";
  if (hours < 1) return `${minutes} m ago`;
  if (days < 1) return `${hours} h ago`;
  if (days === 1) return "yesterday";
  return `${days} d ago`;
}