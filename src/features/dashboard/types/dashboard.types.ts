import type { LucideIcon } from "lucide-react";

export type DashboardStatsResponse = {
  success: boolean;
  stats: {
    clients: {
      total: number;
      enabled: number;
      disabled: number;
    };
    wireguard: {
      connected?: number;
      details?: string[];
      status?: string;
      error?: string;
    };
    recent: Array<{
      name: string;
      lastHandshake: string | null;
      transferRx: number;
      transferTx: number;
    }>;
    users?: {
      total: number;
      active: number;
      suspended: number;
      trial: number;
    };
    routers?: {
      total: number;
      online: number;
      offline: number;
      pending: number;
    };
    billing?: {
      monthlyRevenue: number;
    };
    incidents?: {
      open: number;
    };
    support?: {
      openTickets: number;
    };
    recentActivity?: Array<{
      id: string;
      action: string;
      adminName: string;
      resourceType: string;
      resourceId: string;
      createdAt: string;
    }>;
  };
};

export type DashboardSummaryMetric = {
  title: string;
  value: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  delta?: string;
};

export type DashboardQuickAction = {
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
  permission: string;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
};
