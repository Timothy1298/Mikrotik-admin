import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CheckCircle2, XCircle } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useVpnServerDiagnostics } from "@/features/vpn-servers/hooks/useVpnServers";

dayjs.extend(relativeTime);

export function VpnServerDiagnosticsPanel({ serverId }: { serverId: string }) {
  const diagnosticsQuery = useVpnServerDiagnostics(serverId);
  const diagnostics = diagnosticsQuery.data;
  const healthChecks = diagnostics?.healthChecks ?? [];
  const issues = diagnostics?.issues ?? [];
  const recommendedActions = diagnostics?.recommendedActions ?? [];

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Diagnostics</CardTitle>
          <CardDescription>Automated health checks and recommended actions for this server.</CardDescription>
        </div>
        <RefreshButton loading={diagnosticsQuery.isFetching} onClick={() => void diagnosticsQuery.refetch()} />
      </CardHeader>
      {diagnosticsQuery.isPending ? <SectionLoader /> : null}
      {diagnosticsQuery.isError ? <InlineError message="Diagnostics unavailable" /> : null}
      {diagnostics ? (
        <>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-100">Health checks</p>
            <div className="grid gap-3 md:grid-cols-2">
              {healthChecks.map((check) => (
                <div key={check.check} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
                  <div className="flex items-start gap-3">
                    {check.passed ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> : <XCircle className="mt-0.5 h-4 w-4 text-danger" />}
                    <div>
                      <p className="text-sm font-medium text-slate-100">{check.check}</p>
                      {check.detail ? <p className="mt-1 text-xs text-slate-500">{check.detail}</p> : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-100">Active issues</p>
            {issues.length ? (
              <div className="flex flex-wrap gap-2">
                {issues.map((issue) => (
                  <span
                    key={`${issue.code}-${issue.message}`}
                    className={
                      issue.severity === "critical" || issue.severity === "high"
                        ? "rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger"
                        : issue.severity === "warning" || issue.severity === "medium"
                          ? "rounded-xl border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning"
                          : "rounded-xl border border-brand-500/15 bg-[rgba(8,14,31,0.75)] px-3 py-2 text-xs text-slate-300"
                    }
                  >
                    {issue.message}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">No issues detected.</div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-100">Recommended actions</p>
            {recommendedActions.length ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                {recommendedActions.map((action) => <li key={action}>{action.replace(/_/g, " ")}</li>)}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">No recommended actions at this time.</p>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Analysis generated {diagnostics.generatedAt ? dayjs(diagnostics.generatedAt).fromNow() : "recently"}.
          </p>
        </>
      ) : null}
    </Card>
  );
}
