export type HealthMetric = {
  label: string;
  value: number;
  status: "healthy" | "warning" | "critical";
};
