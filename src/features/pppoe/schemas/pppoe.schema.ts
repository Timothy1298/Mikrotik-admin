import { z } from "zod";

export const pppoeSecretSchema = z.object({
  name: z.string().min(2, "Subscriber username is required"),
  password: z.string().min(4, "Password must be at least 4 characters").optional().or(z.literal("")),
  profile: z.string().min(1, "Profile is required"),
  service: z.enum(["pppoe", "any"]),
  localAddress: z.string().optional(),
  remoteAddress: z.string().optional(),
  comment: z.string().optional(),
  isDisabled: z.boolean().default(false),
});

export const pppoeProfileSchema = z.object({
  name: z.string().min(2, "Profile name is required"),
  rateLimit: z.string().optional(),
  localAddress: z.string().optional(),
  remoteAddress: z.string().optional(),
  comment: z.string().optional(),
});

export type PppoeSecretSchema = z.infer<typeof pppoeSecretSchema>;
export type PppoeProfileSchema = z.infer<typeof pppoeProfileSchema>;
