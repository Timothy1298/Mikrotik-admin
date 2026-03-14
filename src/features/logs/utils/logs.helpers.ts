export function getLogTone(level: string) {
  if (level === "error") return "danger";
  if (level === "warn") return "warning";
  return "info";
}
