import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Copy, Radar, ScanSearch, UserRound } from "lucide-react";
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
  RouterDiscoveryImportResult,
} from "@/features/routers/types/router.types";
import { RouterDiscoveryCandidateCard } from "@/features/routers/components/RouterDiscoveryCandidateCard";
import { RouterDiscoveryMetadataPreview } from "@/features/routers/components/RouterDiscoveryMetadataPreview";
import { DiscoveredRouterUserPickerDialog } from "@/features/routers/components/DiscoveredRouterUserPickerDialog";
import type { UserRow } from "@/features/users/types/user.types";

type SelectedImportUser = Pick<UserRow, "id" | "name" | "email" | "company" | "accountStatus" | "verificationStatus" | "routersCount">;

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
    connectionMode: "wireguard",
    serverNode: "wireguard",
    reason: "",
  });
  const [selectedImportUser, setSelectedImportUser] = useState<SelectedImportUser | null>(null);
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<RouterDiscoveryImportResult | null>(null);

  useEffect(() => {
    setImportForm((current) => ({ ...current, userId: initialUserId || current.userId }));
    if (!initialUserId) {
      return;
    }
    setSelectedImportUser(null);
  }, [initialUserId]);

  useEffect(() => {
    setImportResult(null);
  }, [sessionId, selectedCandidateId]);

  const resultsQuery = useRouterDiscoveryResults(sessionId || undefined);
  const activeSession = useMemo(() => {
    const items = resultsQuery.data || [];
    return sessionId ? items.find((item) => item.id === sessionId) || null : items[0] || null;
  }, [resultsQuery.data, sessionId]);

  const candidates = activeSession?.candidates || [];
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) || null;
  const selectedCandidateSupportsApi = Boolean(selectedCandidate?.openPorts.includes(8728));
  const selectedCandidateSupportsSsh = Boolean(selectedCandidate?.openPorts.includes(22));

  useEffect(() => {
    if (!selectedCandidate) return;
    setImportForm((current) => ({
      ...current,
      sessionId: activeSession?.id || current.sessionId,
      candidateId: selectedCandidate.id,
      name: current.name || selectedCandidate.verification?.metadata?.identity || selectedCandidate.hostname || current.name,
    }));
  }, [activeSession?.id, selectedCandidate]);

  useEffect(() => {
    if (!selectedCandidate) return;
    setCredentials((current) => {
      if (current.method !== "auto") return current;
      return {
        ...current,
        method: selectedCandidate.openPorts.includes(8728) ? "api" : selectedCandidate.openPorts.includes(22) ? "ssh" : "auto",
      };
    });
  }, [selectedCandidate]);

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
        connectionMode: importForm.connectionMode || "wireguard",
        serverNode: importForm.serverNode?.trim() || "wireguard",
        reason: importForm.reason?.trim() || undefined,
      });
      setImportResult(result);
      setSelectedImportUser(null);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to import discovered router");
    }
  };

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setInlineError(null);
    } catch (error) {
      setInlineError(`Failed to copy ${label}.`);
    }
  };

  if (importResult) {
    return (
      <div className="space-y-5">
        <Card className="space-y-4 border-primary/30">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Router imported successfully
              </CardTitle>
              <CardDescription>
                The server-side peer and router record have been created. Complete the MikroTik-side setup below so the router can establish its WireGuard tunnel and the workspace actions can start working.
              </CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Router</p>
              <p className="mt-2 text-sm text-text-primary">{importResult.router.name}</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Assigned VPN IP</p>
              <p className="mt-2 font-mono text-sm text-text-primary">{importResult.router.vpnIp || "Not assigned"}</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Connection mode</p>
              <p className="mt-2 break-words text-sm text-text-primary">
                {importResult.router.connectionMode === "management_only" ? "Management only" : "Managed via WireGuard"}
              </p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-text-muted">Public ports</p>
              <p className="mt-2 text-sm text-text-primary">
                {importResult.router.connectionMode === "management_only"
                  ? "Not allocated for management-only imports"
                  : `Winbox ${importResult.router.ports.winbox} · SSH ${importResult.router.ports.ssh} · API ${importResult.router.ports.api}`}
              </p>
            </div>
          </div>
          {importResult.artifacts ? (
            <div className="rounded-2xl border border-warning/20 bg-primary/10 px-4 py-3 text-sm text-text-primary">
              Paste this script into the MikroTik terminal. It creates the WireGuard interface, assigns the router IP, configures the server peer, and tests reachability to <span className="font-mono">10.0.0.1</span>.
            </div>
          ) : (
            <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-text-primary">
              This router was attached in management-only mode. No WireGuard script is required. The workspace will manage it using the verified local RouterOS access path.
            </div>
          )}
          {inlineError ? <InlineError message={inlineError} /> : null}
          {importResult.artifacts ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">MikroTik setup script</p>
                    <p className="mt-1 text-xs text-text-muted">Run this on the router you just imported.</p>
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    leftIcon={<Copy className="h-4 w-4" />}
                    onClick={() => void handleCopy(importResult.artifacts?.mikrotikScript || "", "MikroTik setup script")}
                    disabled={!importResult.artifacts?.mikrotikScript}
                  >
                    Copy script
                  </Button>
                </div>
                <Textarea
                  label=""
                  value={importResult.artifacts?.mikrotikScript || "No setup script returned."}
                  readOnly
                  className="min-h-[20rem] font-mono text-xs"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">WireGuard config reference</p>
                    <p className="mt-1 text-xs text-text-muted">Useful if you need to compare the generated peer values manually.</p>
                  </div>
                  <Button
                    variant="outline"
                    type="button"
                    leftIcon={<Copy className="h-4 w-4" />}
                    onClick={() => void handleCopy(importResult.artifacts?.wireguardConfig || "", "WireGuard config")}
                    disabled={!importResult.artifacts?.wireguardConfig}
                  >
                    Copy config
                  </Button>
                </div>
                <Textarea
                  label=""
                  value={importResult.artifacts?.wireguardConfig || "No WireGuard config returned."}
                  readOnly
                  className="min-h-[14rem] font-mono text-xs"
                />
              </div>
            </>
          ) : null}
          <div className="flex flex-wrap justify-end gap-3">
            {onCancel ? (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Close
              </Button>
            ) : null}
            <Button type="button" onClick={() => onSuccess?.(importResult.router)}>
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 border-primary/30">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <Radar className="h-5 w-5 text-primary" />
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
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Scanned subnet</p>
                  <p className="mt-1 break-words text-sm text-text-primary">{activeSession.requestedSubnet || activeSession.scannedSubnets.join(", ") || "Auto-detected"}</p>
                </div>
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Visible subnets</p>
                  <p className="mt-1 text-sm text-text-primary">{activeSession.scannedSubnets.length || 0}</p>
                </div>
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Hosts scanned</p>
                  <p className="mt-1 text-sm text-text-primary">{activeSession.hostCountScanned || 0}</p>
                </div>
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Candidates</p>
                  <p className="mt-1 text-sm text-text-primary">{activeSession.candidateCount || candidates.length}</p>
                </div>
                <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-text-muted">Truncation</p>
                  <p className="mt-1 text-sm text-text-primary">{activeSession.truncated ? activeSession.truncatedReason || "Scan was limited for safety" : "Not truncated"}</p>
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
            <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3 text-sm text-text-secondary">
              RouterOS API verification uses the authenticated MikroTik API on port 8728 when available. SSH remains available for environments where API access is disabled.
            </div>
          </div>
          <div className="space-y-3">
            {selectedCandidateSupportsApi ? (
              <div className="rounded-2xl border border-background-border bg-primary/10 px-4 py-3 text-sm text-text-secondary">
                RouterOS API is available on this router and is the recommended verification method for password-based discovery onboarding.
              </div>
            ) : null}
            {credentials.method === "ssh" ? (
              <div className="rounded-2xl border border-warning/20 bg-primary/10 px-4 py-3 text-sm text-text-secondary">
                SSH password verification requires server-side `sshpass` support. If verification fails and this router exposes port `8728`, switch to `RouterOS API`.
              </div>
            ) : null}
            {!selectedCandidateSupportsApi && !selectedCandidateSupportsSsh ? (
              <div className="rounded-2xl border border-danger/20 bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-text-secondary">
                This candidate does not expose RouterOS API (`8728`) or SSH (`22`) in the scan results. Verification may fail until one of those services is reachable.
              </div>
            ) : null}
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
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Assigned customer</p>
                  <p className="mt-1 text-xs text-text-muted">Select the platform user that owns this router before import.</p>
                </div>
                <Button variant="outline" type="button" onClick={() => setUserPickerOpen(true)}>
                  {selectedImportUser || importForm.userId ? "Change customer" : "Select customer"}
                </Button>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-4">
                {selectedImportUser ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary">{selectedImportUser.name}</p>
                        <p className="mt-1 break-words text-sm text-text-secondary">{selectedImportUser.email}</p>
                        <p className="mt-2 text-xs text-text-muted">{selectedImportUser.company || "No company"} • {selectedImportUser.routersCount} router{selectedImportUser.routersCount === 1 ? "" : "s"}</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Badge tone={selectedImportUser.accountStatus === "active" ? "success" : "danger"}>{selectedImportUser.accountStatus}</Badge>
                        <Badge tone={selectedImportUser.verificationStatus === "verified" ? "success" : "warning"}>{selectedImportUser.verificationStatus}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted">Linked user ID: {selectedImportUser.id}</p>
                  </div>
                ) : importForm.userId ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      <UserRound className="h-4 w-4 text-primary" />
                      <span>Router will be linked to the current user context.</span>
                    </div>
                    <p className="text-xs text-text-muted">User reference: {importForm.userId}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <UserRound className="h-4 w-4" />
                    <span>No customer selected yet.</span>
                  </div>
                )}
              </div>
            </div>
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
            <Select
              label="Connection mode"
              value={importForm.connectionMode || "wireguard"}
              onChange={(event) =>
                setImportForm((current) => ({
                  ...current,
                  connectionMode: event.target.value as "wireguard" | "management_only",
                }))
              }
              options={[
                { label: "Managed via WireGuard", value: "wireguard" },
                { label: "Attach for management only", value: "management_only" },
              ]}
            />
          </div>
          <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-3 text-sm text-text-secondary">
            {importForm.connectionMode === "management_only"
              ? "Management-only import keeps the router on its existing network path. No WireGuard peer, public proxy ports, or setup script are required."
              : "WireGuard-managed import allocates a VPN IP, peer, and public proxy ports. You will need to apply the generated MikroTik setup script after import."}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
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

      <DiscoveredRouterUserPickerDialog
        open={userPickerOpen}
        onClose={() => setUserPickerOpen(false)}
        selectedUserId={selectedImportUser?.id || importForm.userId}
        onSelect={(user) => {
          setSelectedImportUser(user);
          setImportForm((current) => ({ ...current, userId: user.id }));
          setInlineError(null);
        }}
      />
    </div>
  );
}
