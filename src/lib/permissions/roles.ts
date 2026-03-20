export const roles = {
  superAdmin: "super_admin",
  supportAdmin: "support_admin",
  networkAdmin: "network_admin",
  billingAdmin: "billing_admin",
  readOnly: "read_only",
} as const;

export type Role = (typeof roles)[keyof typeof roles];
