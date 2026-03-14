import { Activity, Cpu, Router, ShieldAlert } from "lucide-react";
import { ActivityTimeline } from "@/components/data-display/ActivityTimeline";
import { AnalyticsChartCard } from "@/components/data-display/AnalyticsChartCard";
import { SummaryGrid } from "@/components/data-display/SummaryGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { PageSection } from "@/components/shared/PageSection";

export function MonitoringPage() {
  return (
    <section className="space-y-6">
      <PageHeader title="Monitoring" description="A command-center view for tunnel health, router reachability, proxy status, and infrastructure anomalies." meta="Telemetry ready" />
      <SummaryGrid>
        <MetricCard title="Router availability" value="99.9%" progress={99.9} />
        <MetricCard title="Tunnel health" value="96.2%" progress={96.2} />
        <MetricCard title="Proxy readiness" value="91.4%" progress={91.4} />
        <MetricCard title="CPU threshold" value="38%" progress={38} />
      </SummaryGrid>
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AnalyticsChartCard title="Traffic and health overview" description="Reserve this card for Recharts-based traffic, stale peer trends, and node-level stability.">
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-brand-500/15 bg-[rgba(8,14,31,0.9)] text-sm text-slate-500">Chart region placeholder</div>
        </AnalyticsChartCard>
        <PageSection title="Active alerts" description="Surface critical health changes without cluttering operators with noise.">
          <div className="grid gap-3">
            {[{ icon: ShieldAlert, title: "No security incidents", tone: "clear" }, { icon: Router, title: "Router latency within target", tone: "stable" }, { icon: Cpu, title: "Resource usage nominal", tone: "healthy" }].map((item) => {
              const Icon = item.icon;
              return <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-3"><div className="icon-block-primary rounded-2xl p-2 text-slate-100"><Icon className="h-4 w-4" /></div><div><p className="text-sm font-medium text-slate-100">{item.title}</p><p className="font-mono text-xs text-slate-500">Status: {item.tone}</p></div></div>;
            })}
          </div>
        </PageSection>
      </div>
      <ActivityTimeline items={[
        { title: "Tunnel poll completed", time: "2m ago", description: "All visible peers were checked and no stale-handshake anomaly crossed the threshold." },
        { title: "Router heartbeat received", time: "7m ago", description: "Edge router telemetry refreshed and health calculations were updated." },
        { title: "Proxy status sweep finished", time: "12m ago", description: "TCP proxy listeners reported stable readiness across current allocated ports." },
      ]} />
    </section>
  );
}
