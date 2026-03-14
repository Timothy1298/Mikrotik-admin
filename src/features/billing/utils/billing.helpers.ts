export function getBillingHealth(pastDueCount: number) {
  return pastDueCount > 0 ? "warning" : "healthy";
}
