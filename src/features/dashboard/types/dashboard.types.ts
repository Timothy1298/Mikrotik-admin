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
  };
};

export type DashboardSummaryMetric = {
  title: string;
  value: string;
  description: string;
  tone: "info" | "success" | "warning" | "danger" | "neutral";
  delta?: string;
};
