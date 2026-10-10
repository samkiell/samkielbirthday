/**
 * Formats a timestamp into an editorial date and time string.
 * Example output: "October 10, 2026 · 11:04 pm" or "Oct 10, 2026 · 11:04 pm"
 */
export function formatWishDateTime(
  dateInput?: string | Date | null,
  options: { short?: boolean; includeYear?: boolean } = {}
): string {
  if (!dateInput) return "October 11, 2026";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "October 11, 2026";

  const { short = false, includeYear = true } = options;

  const datePart = date.toLocaleDateString("en-US", {
    month: short ? "short" : "long",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  });

  const timePart = date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();

  return `${datePart} · ${timePart}`;
}
