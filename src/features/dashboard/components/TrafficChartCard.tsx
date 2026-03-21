import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Activity, Wifi } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { queryKeys } from "@/config/queryKeys";
import { AnalyticsChartCard } from "@/components/data-display/AnalyticsChartCard";
import { getRouterMetrics } from "@/features/routers/api/getRouters";

type TrafficChartCardProps = {
  routerId: string;
  title: string;
  hours?: number;
};

function formatTraffic(value: number) {
  return `${((value * 8) / (1024 * 1024)).toFixed(value >= 1024 * 1024 ? 1 : 2)} Mbps`;
}

export function TrafficChartCard({ routerId, title, hours = 24 }: TrafficChartCardProps) {
  const metricsQuery = useQuery({
    queryKey: queryKeys.routerMetrics(routerId, hours),
    queryFn: () => getRouterMetrics(routerId, hours),
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: Boolean(routerId),
  });

  const chartData = (metricsQuery.data || []).map((metric) => ({
    timestamp: dayjs(metric.timestamp).format("HH:mm"),
    cpuLoad: metric.cpuLoad ?? 0,
    rxBps: metric.interfaces.reduce((sum, item) => sum + (item.rxBps || 0), 0),
    txBps: metric.interfaces.reduce((sum, item) => sum + (item.txBps || 0), 0),
  }));

  return (
    <AnalyticsChartCard
      title={title}
      description={`Router CPU load and aggregate interface traffic for the last ${hours} hour${hours === 1 ? "" : "s"}.`}
      action={<div className="text-xs text-slate-400">Live telemetry</div>}
    >
      {metricsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-[220px] w-full" />
        </div>
      ) : metricsQuery.isError ? (
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={Activity}
            title="Telemetry unavailable"
            description="Metrics could not be loaded for this router yet. Confirm API credentials and the polling job."
          />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={Wifi}
            title="No telemetry samples"
            description="The polling job has not stored any metric samples for this router in the selected time window."
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(37,99,235,0.12)" vertical={false} />
            <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis
              yAxisId="cpu"
              orientation="left"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="traffic"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => formatTraffic(Number(value))}
            />
            <Tooltip
              cursor={{ stroke: "rgba(37,99,235,0.35)", strokeWidth: 1 }}
              contentStyle={{ background: "rgba(8,14,31,0.9)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: 18, color: "#e2e8f0" }}
              formatter={(value: number, name: string) => {
                if (name === "CPU") return [`${Math.round(Number(value))}%`, name];
                return [formatTraffic(Number(value)), name];
              }}
            />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
            <Line yAxisId="cpu" type="monotone" dataKey="cpuLoad" name="CPU" stroke="#38bdf8" strokeWidth={2.5} dot={false} />
            <Line yAxisId="traffic" type="monotone" dataKey="rxBps" name="RX" stroke="#34d399" strokeWidth={2.25} dot={false} />
            <Line yAxisId="traffic" type="monotone" dataKey="txBps" name="TX" stroke="#f59e0b" strokeWidth={2.25} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </AnalyticsChartCard>
  );
}
