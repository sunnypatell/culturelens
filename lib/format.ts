/**
 * shared formatting utilities
 */

interface FormatRelativeDateOptions {
  /** use abbreviated units like "h" and "d" instead of "hours" and "days" */
  short?: boolean;
}

/**
 * formats a date as a relative time string (e.g. "just now", "3 hours ago", "yesterday")
 */
export function formatRelativeDate(
  date: Date,
  options: FormatRelativeDateOptions = {}
): string {
  const { short = false } = options;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "just now";
  if (diffHours < 24)
    return short ? `${diffHours}h ago` : `${diffHours} hours ago`;
  if (diffDays === 1) return "yesterday";
  if (!short && diffDays >= 7) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  return short ? `${diffDays}d ago` : `${diffDays} days ago`;
}

/**
 * formats milliseconds into a duration string (MM:SS or HH:MM:SS)
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * parses a createdAt field that may be a string or a Firestore timestamp object
 */
export function parseCreatedAt(
  createdAt: string | { _seconds: number } | undefined | null
): Date {
  let date: Date;
  if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "_seconds" in createdAt
  ) {
    date = new Date(createdAt._seconds * 1000);
  } else if (createdAt) {
    date = new Date(createdAt);
  } else {
    date = new Date();
  }

  if (isNaN(date.getTime())) {
    date = new Date();
  }

  return date;
}
