import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useRouterDiagnostics } from "@/features/routers/hooks/useRouter";

export function RouterDiagnosticsPanel({ routerId }: { routerId: string }) {
  const diagnosticsQuery = useRouterDiagnostics(routerId);
  const diagnostics = diagnosticsQuery.data;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Diagnostics</CardTitle>
          <CardDescription>Operational issues and recommended actions derived from router diagnostics.</CardDescription>
        </div>
        <RefreshButton loading={diagnosticsQuery.isFetching} onClick={() => void diagnosticsQuery.refetch()} />
      </CardHeader>
      {diagnosticsQuery.isPending ? <SectionLoader /> : null}
      {diagnosticsQuery.isError ? <InlineError message="Unable to load router diagnostics." /> : null}
      {diagnostics ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-background-border bg-background-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Status</p>
            <p className="mt-2 text-sm text-text-primary">{diagnostics.status.replace(/_/g, " ")}</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">Issues</p>
            {diagnostics.issues.length ? (
              <div className="flex flex-wrap gap-2">
                {diagnostics.issues.map((issue) => (
                  <span
                    key={`${issue.code}-${issue.message}`}
                    className="rounded-xl border border-danger/20 bg-danger/10 px-3 py-2 text-xs text-danger"
                  >
                    {issue.message}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-secondary">No active diagnostics issues were reported.</p>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">Recommended actions</p>
            {diagnostics.recommendedActions.length ? (
              <ol className="list-decimal space-y-2 pl-5 text-sm text-text-secondary">
                {diagnostics.recommendedActions.map((action) => (
                  <li key={action}>{action.replace(/_/g, " ")}</li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-text-secondary">No recommended actions at this time.</p>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
