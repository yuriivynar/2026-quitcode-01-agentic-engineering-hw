/** `HH:MM:SS`, used for the live timer and per-task totals. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

/** `2h 14m` / `14m` / `< 1m` — easier to scan than HH:MM:SS in summaries. */
export function formatDurationCompact(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return totalMinutes > 0 ? `${minutes}m` : '< 1m';
}

/**
 * Hours as a decimal, the way timesheets and invoices express them:
 * 2h 30m becomes `2.50`. Rounded to two places, so a day of short sessions
 * still adds up close to the true total.
 */
export function formatDecimalHours(ms: number): string {
  return (Math.max(0, ms) / 3_600_000).toFixed(2);
}
/** Wall-clock time of day, e.g. `09:41`. */
export function formatClock(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString([], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** `Today` / `Yesterday` / `Friday, 5 September` for history day headings. */
export function formatDayLabel(timestamp: number, now: number): string {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return formatDay(timestamp);
}
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

/**
 * `crypto.randomUUID` is only available in secure contexts, which excludes
 * plain-http dev servers reached over a LAN, so fall back to a good-enough id.
 */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
