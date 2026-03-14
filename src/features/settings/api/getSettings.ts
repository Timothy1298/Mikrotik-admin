import { env } from "@/config/env";

export async function getSettings() {
  return {
    appName: env.appName,
    appEnv: env.appEnv,
    apiBaseUrl: env.apiBaseUrl,
    requestTimeout: env.requestTimeout,
    mockModeEnabled: env.enableMocks,
  };
}
