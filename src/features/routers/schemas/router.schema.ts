import { z } from "zod";

export const createRouterSchema = z.object({
  name: z.string().min(3, "Router name is too short"),
  notes: z.string().optional(),
});
