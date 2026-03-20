import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Radar, ScanSearch } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  useImportDiscoveredRouter,
  useRouterDiscoveryResults,
  useRouterDiscoveryScan,
  useVerifyDiscoveredRouter,
} from "@/features/routers/hooks/useRouter";
import type {
  CreateRouterResponse,
  RouterDiscoveryCandidate,
  RouterDiscoveryImportPayload,
} from "@/features/routers/types/router.types";
import { RouterDiscoveryCandidateCard } from "@/features/routers/components/RouterDiscoveryCandidateCard";
import { RouterDiscoveryMetadataPreview } from "@/features/routers/components/RouterDiscoveryMetadataPreview";

export function RouterDiscoveryPanel({
  initialUserId = "",
  onCancel,
  onSuccess,
}: {
  initialUserId?: string;
  onCancel?: () => void;
  onSuccess?: (router: CreateRouterResponse) => void;
}) {
  const scanMutation = useRouterDiscoveryScan();
  const verifyMutation = useVerifyDiscoveredRouter();
  const importMutation = useImportDiscoveredRouter();
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [scanForm, setScanForm] = useState({ subnet: "", reason: "" });
  const [credentials, setCredentials] = useState<{ username: string; password: string; method: "auto" | "ssh" | "api" }>({
    username: "admin",
    password: "",
    method: "auto",
  });
  const [importForm, setImportForm] = useState<RouterDiscoveryImportPayload>({
    sessionId: "",
    candidateId: "",
    userId: initialUserId || "",
    name: "",
    serverNode: "wireguard",
    reason: "",
  });
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    setImportForm((current) => ({ ...current, userId: initialUserId || current.userId }));
  }, [initialUserId]);

  const resultsQuery = useRouterDiscoveryResults(sessionId || undefined);
  const activeSession = useMemo(() => {
    const items = resultsQuery.data || [];
    return sessionId ? items.find((item) => item.id === sessionId) || null : items[0] || null;
  }, [resultsQuery.data, sessionId]);

  const candidates = activeSession?.candidates || [];
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) || null;

  useEffect(() => {
    if (!selectedCandidate) return;
    setImportForm((current) => ({
      ...current,
      sessionId: activeSession?.id || current.sessionId,
      candidateId: selectedCandidate.id,
      name: current.name || selectedCandidate.verification?.metadata?.identity || selectedCandidate.hostname || current.name,
    }));
  }, [activeSession?.id, selectedCandidate]);

  const handleStartScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError(null);
    try {
      const session = await scanMutation.mutateAsync({
        subnet: scanForm.subnet.trim() || undefined,
        reason: scanForm.reason.trim() || undefined,
      });
      setSessionId(session.id);
      setSelectedCandidateId("");
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to start discovery scan");
    }
  };

  const handleVerify = async () => {
    if (!activeSession || !selectedCandidate) return;
    setInlineError(null);
    if (!credentials.username.trim() || !credentials.password) {
      setInlineError("Username and password are required to verify a discovered router.");
      return;
    }

    try {
      const result = await verifyMutation.mutateAsync({
        sessionId: activeSession.id,
        candidateId: selectedCandidate.id,
        username: credentials.username.trim(),
        password: credentials.password,
        method: credentials.method,
      });
      setSessionId(result.session.id);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Could not verify router credentials");
    }
  };

  const handleImport = async () => {
    if (!activeSession || !selectedCandidate) return;
    setInlineError(null);
    if (!importForm.userId.trim()) {
      setInlineError("Subscriber user ID or email is required before import.");
      return;
    }

    try {
      const result = await importMutation.mutateAsync({
        sessionId: activeSession.id,
        candidateId: selectedCandidate.id,
        userId: importForm.userId.trim(),
        name: (importForm.name || "").trim() || undefined,
        serverNode: importForm.serverNode?.trim() || "wireguard",
        reason: importForm.reason?.trim() || undefined,
      });
      onSuccess?.(result.router);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to import discovered router");
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4 border-brand-500/25">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <Radar className="h-5 w-5 text-brand-100" />
              Discover on this network
            </CardTitle>
            <CardDescription>
              Scans a subnet from the backend host or a configured local discovery agent, identifies likely MikroTik routers, then lets you verify credentials and import safely.
            </CardDescription>
          </div>
        </CardHeader>
        <form className="space-y-4" onSubmit={handleStartScan}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label="Subnet to scan"
              placeholder="Optional, e.g. 192.168.88.0/24"
              hint="Leave blank to scan subnets visible to the backend/local discovery agent."
              value={scanForm.subnet}
              onChange={(event) => setScanForm((current) => ({ ...current, subnet: event.target.value }))}
            />
            <Input
              label="Reason"
              placeholder="Optional audit note"
              value={scanForm.reason}
              onChange={(event) => setScanForm((current) => ({ ...current, reason: event.target.value }))}
            />
          </div>
          {inlineError ? <InlineError message={inlineError} /> : null}
          <div className="flex flex-wrap justify-end gap-3">
            {onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
            <Button type="submit" leftIcon={<ScanSearch className="h-4 w-4" />} isLoading={scanMutation.isPending}>
              Discover routers on this network
            </Button>
          </div>
        </form>
      </Card>

      {resultsQuery.isPending && sessionId ? <SectionLoader /> : null}
      {resultsQuery.isError ? <ErrorState title="Unable to load discovery results" description="The discovery results API could not be loaded. Retry after confirming the router discovery routes are reachable." onAction={() => void resultsQuery.refetch()} /> : null}

      {activeSession ? (
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <CardTitle>Discovery results</CardTitle>
                  <CardDescription>
                    {activeSession.status === "scanning" || activeSession.status === "pending"
                      ? "Scanning local network..."
                      : `${candidates.length} candidate router${candidates.length === 1 ? "" : "s"} found`}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                  <Badge tone={activeSession.source === "agent" ? "info" : "warning"}>
                    {activeSession.source === "agent" ? "Local agent" : "Backend host scan"}
                  </Badge>
                  <Badge tone={activeSession.status === "completed" ? "success" : activeSession.status === "failed" ? "danger" : "warning"}>
                    {activeSession.status}
                  </Badge>
                  <Button variant="outline" onClick={() => void resultsQuery.refetch()}>Refresh results</Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Scanned subnet</p>
                  <p className="mt-1 break-words text-sm text-slate-100">{activeSession.requestedSubnet || activeSession.scannedSubnets.join(", ") || "Auto-detected"}</p>
                </div>
                <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Visible subnets</p>
                  <p className="mt-1 text-sm text-slate-100">{activeSession.scannedSubnets.length || 0}</p>
                </div>
                <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Hosts scanned</p>
                  <p className="mt-1 text-sm text-slate-100">{activeSession.hostCountScanned || 0}</p>
                </div>
                <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Candidates</p>
                  <p className="mt-1 text-sm text-slate-100">{activeSession.candidateCount || candidates.length}</p>
                </div>
                <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Truncation</p>
                  <p className="mt-1 text-sm text-slate-100">{activeSession.truncated ? activeSession.truncatedReason || "Scan was limited for safety" : "Not truncated"}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          {activeSession.error ? <InlineError message={activeSession.error} /> : null}
          {activeSession.truncated ? <InlineError message={activeSession.truncatedReason || "The scan was truncated to a safe host limit. Narrow the subnet for a more precise result."} /> : null}
          <div className="space-y-3">
            {candidates.length ? candidates.map((candidate) => (
              <RouterDiscoveryCandidateCard
                key={candidate.id}
                candidate={candidate}
                selected={candidate.id === selectedCandidateId}
                onSelect={() => setSelectedCandidateId(candidate.id)}
              />
            )) : activeSession.status === "completed" ? (
              <EmptyState icon={Radar} title="No candidate routers found" description="No reachable MikroTik-like devices were detected on the scanned subnet. Try a narrower subnet or use the bootstrap claim flow." />
            ) : null}
          </div>
        </Card>
      ) : null}

      {selectedCandidate ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Verify selected router</CardTitle>
              <CardDescription>Provide router credentials so the platform can confirm this is a reachable MikroTik device and fetch metadata safely.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label="Router username"
              value={credentials.username}
              onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))}
            />
            <PasswordInput
              label="Router password"
              value={credentials.password}
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Select
              label="Verification method"
              value={credentials.method}
              onChange={(event) => setCredentials((current) => ({ ...current, method: event.target.value as "auto" | "ssh" | "api" }))}
              options={[
                { label: "Auto (prefer RouterOS API, fallback to SSH)", value: "auto" },
                { label: "RouterOS API", value: "api" },
                { label: "SSH", value: "ssh" },
              ]}
            />
            <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 py-3 text-sm text-slate-400">
              RouterOS API verification uses the authenticated MikroTik API on port 8728 when available. SSH remains available for environments where API access is disabled.
            </div>
          </div>
          <div className="flex justify-end">
            <Button isLoading={verifyMutation.isPending} onClick={handleVerify}>
              Verify router credentials
            </Button>
          </div>
        </Card>
      ) : null}

      {selectedCandidate?.verification ? (
        <RouterDiscoveryMetadataPreview verification={selectedCandidate.verification} />
      ) : null}

      {selectedCandidate?.verification?.status === "verified" && selectedCandidate.verification.readiness?.duplicateRouterId === null ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Import discovered router</CardTitle>
              <CardDescription>Assign the verified router to a subscriber, review the generated name, and adopt it into managed provisioning.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label="Subscriber user ID or email"
              value={importForm.userId}
              onChange={(event) => setImportForm((current) => ({ ...current, userId: event.target.value }))}
              placeholder="subscriber@example.com"
            />
            <Input
              label="Router name"
              value={importForm.name || ""}
              onChange={(event) => setImportForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Auto-filled from router identity"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Input
              label="Server node"
              value={importForm.serverNode || "wireguard"}
              onChange={(event) => setImportForm((current) => ({ ...current, serverNode: event.target.value }))}
            />
            <Textarea
              label="Admin reason"
              value={importForm.reason || ""}
              onChange={(event) => setImportForm((current) => ({ ...current, reason: event.target.value }))}
              placeholder="Why is this router being imported from discovery?"
            />
          </div>
          <div className="flex justify-end">
            <Button isLoading={importMutation.isPending} onClick={handleImport}>
              Import discovered router
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
