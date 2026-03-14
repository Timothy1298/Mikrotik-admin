import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1),
  VITE_APP_NAME: z.string().default("Mikrotik Admin"),
  VITE_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_ENABLE_MOCKS: z.coerce.boolean().default(false),
  VITE_REQUEST_TIMEOUT: z.coerce.number().positive().default(15000),
});

const parsed = envSchema.parse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_ENABLE_MOCKS: import.meta.env.VITE_ENABLE_MOCKS,
  VITE_REQUEST_TIMEOUT: import.meta.env.VITE_REQUEST_TIMEOUT,
});

export const env = {
  apiBaseUrl: parsed.VITE_API_BASE_URL,
  appName: parsed.VITE_APP_NAME,
  appEnv: parsed.VITE_APP_ENV,
  enableMocks: parsed.VITE_ENABLE_MOCKS,
  requestTimeout: parsed.VITE_REQUEST_TIMEOUT,
};
