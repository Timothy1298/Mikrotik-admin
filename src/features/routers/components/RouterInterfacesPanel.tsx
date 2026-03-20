import { Network } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { InlineError } from "@/components/feedback/InlineError";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useRouterInterfaces } from "@/features/routers/hooks/useRouter";

export function RouterInterfacesPanel({ routerId }: { routerId: string }) {
  const interfacesQuery = useRouterInterfaces(routerId);
  const interfaces = interfacesQuery.data?.interfaces || [];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Interfaces</CardTitle>
          <CardDescription>Live interface state returned directly by the router over SSH.</CardDescription>
        </div>
        <RefreshButton loading={interfacesQuery.isFetching} onClick={() => void interfacesQuery.refetch()} />
      </CardHeader>

      {interfacesQuery.isError ? (
        <InlineError message="Interface data unavailable" />
      ) : !interfaces.length && !interfacesQuery.isPending ? (
        <EmptyState icon={Network} title="No interfaces returned by this router" description="The router did not return any interface details for this live query." />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-500/15 text-xs uppercase tracking-[0.18em] text-slate-500">
                <th className="px-3 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Running</th>
                <th className="px-3 py-3 font-medium">Disabled</th>
                <th className="px-3 py-3 font-medium">Comment</th>
              </tr>
            </thead>
            <tbody>
              {interfaces.map((item) => (
                <tr key={`${item.name}-${item.type}`} className="border-b border-brand-500/10 text-slate-200 last:border-b-0">
                  <td className="px-3 py-3 font-medium text-slate-100">{item.name}</td>
                  <td className="px-3 py-3">{item.type}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.running ? "bg-success" : "bg-danger"}`} />
                      <span>{item.running ? "Running" : "Down"}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3">{item.disabled ? "Yes" : "No"}</td>
                  <td className="px-3 py-3 text-slate-400">{item.comment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
