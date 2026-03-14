export function getRouterHealthLabel(status: string) {
  switch (status) {
    case "active":
      return "Healthy";
    case "pending":
      return "Provisioning";
    case "offline":
      return "Needs attention";
    default:
      return "Inactive";
  }
}
