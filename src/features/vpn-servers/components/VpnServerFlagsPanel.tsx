import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { VpnServerDetail } from "@/features/vpn-servers/types/vpn-server.types";
import { formatDateTime } from "@/lib/formatters/date";

export function VpnServerFlagsPanel({ server, onRemoveFlag }: { server: VpnServerDetail; onRemoveFlag: (flag: VpnServerDetail["flags"][number]) => void }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Flags</CardTitle>
          <CardDescription>Active infrastructure flags attached to this server.</CardDescription>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {server.flags.length ? server.flags.map((flag) => (
          <div key={flag.id || `${flag.flag}-${flag.createdAt}`} className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{flag.flag.replace(/_/g, " ")}</p>
                <p className="mt-1 text-sm text-slate-400">{flag.description || "No description provided."}</p>
                <p className="mt-2 text-xs text-slate-500">{flag.severity} • {flag.createdBy}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-mono text-xs text-slate-500">{formatDateTime(flag.createdAt)}</span>
                <Button variant="ghost" onClick={() => onRemoveFlag(flag)}>Remove</Button>
              </div>
            </div>
          </div>
        )) : <p className="text-sm text-slate-400">No flags are active for this server right now.</p>}
      </div>
    </Card>
  );
}
