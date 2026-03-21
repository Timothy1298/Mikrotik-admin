import { z } from "zod";

export const hotspotUserSchema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(4, "Password must be at least 4 characters").optional().or(z.literal("")),
  profile: z.string().min(1, "Profile is required"),
  dataLimitValue: z.coerce.number().min(0, "Data limit cannot be negative"),
  dataLimitUnit: z.enum(["unlimited", "MB", "GB"]),
  timeLimitValue: z.coerce.number().min(0, "Time limit cannot be negative"),
  timeLimitUnit: z.enum(["unlimited", "hours", "days"]),
  expiresAt: z.string().optional().nullable(),
  comment: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const voucherGenerationSchema = z.object({
  count: z.coerce.number().int().min(1, "Generate at least one voucher").max(100, "Maximum is 100 vouchers"),
  prefix: z.string().max(8, "Prefix must be 8 characters or less").optional(),
  profile: z.string().min(1, "Profile is required"),
  dataLimitValue: z.coerce.number().min(0, "Data limit cannot be negative"),
  dataLimitUnit: z.enum(["unlimited", "MB", "GB"]),
  timeLimitValue: z.coerce.number().min(0, "Time limit cannot be negative"),
  timeLimitUnit: z.enum(["unlimited", "hours", "days"]),
  expiresAt: z.string().optional().nullable(),
});

export type HotspotUserSchema = z.infer<typeof hotspotUserSchema>;
export type VoucherGenerationSchema = z.infer<typeof voucherGenerationSchema>;
