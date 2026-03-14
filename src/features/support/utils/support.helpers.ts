export function getPriorityTone(priority: string) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  return "info";
}
