import { useState } from "react";
import { ShieldAlert, TerminalSquare } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useRunRouterCommand } from "@/features/routers/hooks/useRouter";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";

export function RouterTerminalPanel({ routerId }: { routerId: string }) {
  const { data: user } = useCurrentUser(true);
  const runCommandMutation = useRunRouterCommand();
  const [command, setCommand] = useState("");
  const [reason, setReason] = useState("");
  const [output, setOutput] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  if (!can(user, permissions.routersRunCommand)) {
    return null;
  }

  const handleRun = async () => {
    if (!command.trim() || !reason.trim()) {
      setInlineError("Command and reason are required before execution.");
      return;
    }

    setInlineError(null);
    setOutput("");

    try {
      const result = await runCommandMutation.mutateAsync({
        id: routerId,
        payload: { command: command.trim(), reason: reason.trim() },
      });

      if (!result.success) {
        setInlineError(result.error || "Command execution failed");
        return;
      }

      setOutput(result.output || "Command completed with no output.");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Command execution failed");
    }
  };

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Live terminal</CardTitle>
          <CardDescription>Run a single RouterOS command directly on the live router. Every execution is audited.</CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto]">
        <Input label="RouterOS Command" placeholder="/system resource print" value={command} onChange={(event) => setCommand(event.target.value)} />
        <Input label="Reason" placeholder="Diagnosing memory issue ticket #123" value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="flex items-end">
          <Button className="w-full lg:w-auto" onClick={() => void handleRun()} isLoading={runCommandMutation.isPending} leftIcon={<TerminalSquare className="h-4 w-4" />}>
            Run
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Commands run directly on the live router. All executions are logged.</span>
        </div>
      </div>

      {inlineError ? <InlineError message={inlineError} /> : null}

      <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.96)] p-4">
        <pre className="min-h-40 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm text-slate-200">
          {output || "Command output will appear here."}
        </pre>
      </div>
    </Card>
  );
}
