import dayjs from "dayjs";

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY, HH:mm");
}

export function formatRelativeTime(value?: string | Date | null) {
  if (!value) return "-";
  const now = dayjs();
  const target = dayjs(value);
  const minutes = Math.round(now.diff(target, "minute", true));

  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;

  const hours = Math.round(now.diff(target, "hour", true));
  if (Math.abs(hours) < 24) return `${hours}h ago`;

  const days = Math.round(now.diff(target, "day", true));
  if (Math.abs(days) < 30) return `${days}d ago`;

  return target.format("DD MMM YYYY");
}
