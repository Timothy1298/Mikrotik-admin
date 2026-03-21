import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSettings } from "@/features/settings/hooks/useSettings";

export function SettingsPanels() {
  const settingsQuery = useSettings();
  const settings = settingsQuery.data;

  return (
    <Card>
      <CardHeader className="mb-0">
        <div>
          <CardTitle>Runtime settings snapshot</CardTitle>
          <CardDescription>Compatibility surface for direct settings feature consumers.</CardDescription>
        </div>
      </CardHeader>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Application</p>
          <p className="mt-2 text-sm font-medium text-text-primary">{settings?.appName ?? "Loading..."}</p>
        </div>
        <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Environment</p>
          <p className="mt-2 text-sm font-medium text-text-primary">{settings?.appEnv ?? "Loading..."}</p>
        </div>
      </div>
    </Card>
  );
}
