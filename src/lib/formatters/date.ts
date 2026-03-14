import dayjs from "dayjs";

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "-";
  return dayjs(value).format("DD MMM YYYY, HH:mm");
}
