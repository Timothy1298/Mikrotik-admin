export type SettingsState = {
  appName: string;
  appEnv: string;
  apiBaseUrl: string;
  requestTimeout: number;
  mockModeEnabled: boolean;
};

export type PlatformConfig = {
  routerMonthlyPrice: number;
  trialDays: number;
  serverRegion: string;
  supportEmail: string;
  billingGraceDays: number;
  appVersion: string;
  updatedAt?: string | null;
  updatedBy?: string;
};

export type UpdatePlatformConfigPayload = {
  routerMonthlyPrice?: number;
  trialDays?: number;
  serverRegion?: string;
  supportEmail?: string;
  billingGraceDays?: number;
  reason?: string;
};
