import { z } from "zod";

export const ipAddressSchema = z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/u, "Invalid IP address");
export const cidrSchema = z.string().regex(/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/u, "Invalid CIDR notation");
