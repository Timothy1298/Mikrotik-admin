import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { AnalyticsChartCard } from "@/components/data-display/AnalyticsChartCard";
import type { MonitoringTrends } from "@/features/monitoring/types/monitoring.types";

export function MonitoringTrendCard({
  title,
  description,
  trends,
  dataKey,
  secondaryKey,
}: {
  title: string;
  description: string;
  trends: MonitoringTrends;
  dataKey: string;
  secondaryKey?: string;
}) {
  return (
    <AnalyticsChartCard title={title} description={description}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trends.series}>
          <defs>
            <linearGradient id="trendPrimary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="trendSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(37,99,235,0.12)" vertical={false} />
          <XAxis dataKey="timestamp" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "rgba(8,14,31,0.9)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 16, color: "#e2e8f0" }}
            labelStyle={{ color: "#e0f2fe" }}
          />
          <Area type="monotone" dataKey={dataKey} stroke="#38bdf8" fill="url(#trendPrimary)" strokeWidth={2} />
          {secondaryKey ? <Area type="monotone" dataKey={secondaryKey} stroke="#2563eb" fill="url(#trendSecondary)" strokeWidth={2} /> : null}
        </AreaChart>
      </ResponsiveContainer>
    </AnalyticsChartCard>
  );
}
