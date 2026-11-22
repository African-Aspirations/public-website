/** Dates in Ghana time (the team's), e.g. "22 Nov 2026, 14:05". */
const dt = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Accra",
});
export const formatDateTime = (d: Date) => dt.format(d);

/** "5 min ago", "3 h ago", "2 d ago", then the date. */
export function timeAgo(d: Date, now = Date.now()) {
  const m = Math.round((now - d.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 24 * 60) return `${Math.round(m / 60)} h ago`;
  if (m < 7 * 24 * 60) return `${Math.round(m / 1440)} d ago`;
  return formatDateTime(d).split(",")[0] ?? "";
}
