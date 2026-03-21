import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Copy, Router, ShieldCheck, UserRound, Wifi, XCircle } from "lucide-react";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { RouterDiscoveryPanel } from "@/features/routers/components/RouterDiscoveryPanel";
import {
  useAdoptRouterOnboardingClaim,
  useCancelRouterOnboardingClaim,
  useCreateRouterAdmin,
  useCreateRouterOnboardingClaim,
  useRouterOnboardingClaims,
} from "@/features/routers/hooks/useRouter";
import type {
  CreateRouterPayload,
  CreateRouterResponse,
  RouterOnboardingClaim,
  RouterOnboardingClaimPayload,
} from "@/features/routers/types/router.types";
import { formatDateTime } from "@/lib/formatters/date";

type RouterAdminCreateFormProps = {
  mode?: "dialog" | "page";
  submitLabel?: string;
  onCancel?: () => void;
  onSuccess?: (router: CreateRouterResponse) => void;
  initialUserId?: string;
};

type ClaimState = {
  token: string;
  callbackUrl: string;
  bootstrapScript: string;
  claimId: string;
};

function statusTone(status: RouterOnboardingClaim["status"]) {
  switch (status) {
    case "claimed":
      return "success";
    case "adopted":
      return "info";
    case "expired":
    case "cancelled":
      return "danger";
    default:
      return "warning";
  }
}

function ClaimProvisioningPanel({
  initialUserId,
  onCancel,
  onSuccess,
}: {
  initialUserId?: string;
  onCancel?: () => void;
  onSuccess?: (router: CreateRouterResponse) => void;
}) {
  const createClaimMutation = useCreateRouterOnboardingClaim();
  const adoptClaimMutation = useAdoptRouterOnboardingClaim();
  const cancelClaimMutation = useCancelRouterOnboardingClaim();
  const claimsQuery = useRouterOnboardingClaims();
  const [form, setForm] = useState<RouterOnboardingClaimPayload>({
    userId: initialUserId || "",
    name: "",
    serverNode: "wireguard",
    reason: "",
    expectedAddressHint: "",
    expiresInHours: 24,
  });
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<ClaimState | null>(null);

  useEffect(() => {
    setForm((current) => ({ ...current, userId: initialUserId || current.userId }));
  }, [initialUserId]);

  const visibleClaims = useMemo(() => {
    const items = claimsQuery.data || [];
    return initialUserId ? items.filter((item) => item.user?.id === initialUserId) : items;
  }, [claimsQuery.data, initialUserId]);

  const handleClaimSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError(null);

    if (!form.userId?.trim() || !form.name.trim()) {
      setInlineError("Subscriber user ID/email and router name are required.");
      return;
    }

    try {
      const response = await createClaimMutation.mutateAsync({
        userId: form.userId.trim(),
        name: form.name.trim(),
        serverNode: form.serverNode?.trim() || "wireguard",
        reason: form.reason?.trim() || undefined,
        expectedAddressHint: form.expectedAddressHint?.trim() || undefined,
        expiresInHours: form.expiresInHours || 24,
      });
      setClaimState({
        token: response.token,
        callbackUrl: response.callbackUrl,
        bootstrapScript: response.bootstrapScript,
        claimId: response.claim.id,
      });
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to generate router claim");
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-4 border-primary/30">
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2 text-text-primary">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Claim-based onboarding
            </CardTitle>
            <CardDescription>
              Recommended. Generate a one-time claim token, run the bootstrap script on the router, then adopt the detected router only after it calls home.
            </CardDescription>
          </div>
        </CardHeader>
        <form className="space-y-5" onSubmit={handleClaimSubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Subscriber user ID or email"
              placeholder="subscriber@example.com"
              value={form.userId}
              onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
              leftIcon={<UserRound className="h-4 w-4" />}
              required
            />
            <Input
              label="Router name"
              placeholder="e.g. branch-office-nairobi"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              leftIcon={<Router className="h-4 w-4" />}
              required
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <Input
              label="Server node"
              placeholder="wireguard"
              value={form.serverNode}
              onChange={(event) => setForm((current) => ({ ...current, serverNode: event.target.value }))}
            />
            <Input
              label="Expected router public IP"
              placeholder="Optional hint"
              value={form.expectedAddressHint || ""}
              onChange={(event) => setForm((current) => ({ ...current, expectedAddressHint: event.target.value }))}
            />
            <Input
              label="Claim expiry hours"
              type="number"
              min="1"
              max="72"
              value={String(form.expiresInHours || 24)}
              onChange={(event) => setForm((current) => ({ ...current, expiresInHours: Number(event.target.value) || 24 }))}
            />
          </div>

          <Textarea
            label="Admin reason"
            placeholder="Why is this router being onboarded?"
            value={form.reason || ""}
            onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          />

          {inlineError ? <InlineError message={inlineError} /> : null}

          <div className="flex flex-wrap justify-end gap-3">
            {onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
            <Button type="submit" isLoading={createClaimMutation.isPending}>Generate Claim</Button>
          </div>
        </form>
      </Card>

      {claimState ? (
        <Card className="space-y-4 border-primary/20 bg-primary/10">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-text-primary">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Claim ready
              </CardTitle>
              <CardDescription>Run the script below on the MikroTik router. Once it calls home, the claim will move to detected status and can be adopted.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Claim token</p>
                <CopyButton value={claimState.token} />
              </div>
              <p className="mt-2 font-mono text-sm text-text-primary break-all">{claimState.token}</p>
            </div>
            <div className="rounded-2xl border border-background-border bg-background-panel p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Bootstrap script</p>
                <CopyButton value={claimState.bootstrapScript} />
              </div>
              <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-background-main/60 p-3 text-xs text-text-primary">{claimState.bootstrapScript}</pre>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Onboarding claims</CardTitle>
              <CardDescription>Recent claim sessions waiting for router callback or adoption.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => void claimsQuery.refetch()}>Refresh claims</Button>
          </div>
        </CardHeader>
        {claimsQuery.isPending ? <SectionLoader /> : claimsQuery.isError ? <InlineError message="Unable to load router claims." /> : (
          <div className="space-y-3">
            {visibleClaims.length ? visibleClaims.map((claim) => (
              <div key={claim.id} className="rounded-2xl border border-background-border bg-background-panel p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-text-primary">{claim.requestedName}</p>
                      <Badge tone={statusTone(claim.status) as "success" | "info" | "danger" | "warning"}>{claim.status}</Badge>
                      {claim.detected.matchedExpectedAddress === true ? <Badge tone="success">IP match</Badge> : null}
                      {claim.detected.matchedExpectedAddress === false ? <Badge tone="warning">IP mismatch</Badge> : null}
                    </div>
                    <p className="text-sm text-text-secondary">{claim.user?.name || "Unknown subscriber"} • {claim.user?.email || "No email"} • {claim.serverNode}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                      <span>Created {formatDateTime(claim.createdAt)}</span>
                      <span>Expires {formatDateTime(claim.expiresAt)}</span>
                      {claim.claimedAt ? <span>Detected {formatDateTime(claim.claimedAt)}</span> : null}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                      <span className="inline-flex items-center gap-1"><Wifi className="h-3.5 w-3.5" /> Source IP: {claim.detected.sourceIp || "waiting for callback"}</span>
                      <span>Identity: {claim.detected.identity || "not reported"}</span>
                      {claim.expectedAddressHint ? <span>Expected IP: {claim.expectedAddressHint}</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {claim.status === "claimed" ? (
                      <Button
                        isLoading={adoptClaimMutation.isPending}
                        onClick={() => void adoptClaimMutation.mutateAsync({ id: claim.id, payload: { reason: "Adopted from claim-based onboarding" } }).then((response) => onSuccess?.(response.router))}
                      >
                        Adopt router
                      </Button>
                    ) : null}
                    {["pending", "claimed"].includes(claim.status) ? (
                      <Button variant="outline" isLoading={cancelClaimMutation.isPending} onClick={() => void cancelClaimMutation.mutateAsync({ id: claim.id, reason: "Cancelled from onboarding panel" })}>
                        Cancel claim
                      </Button>
                    ) : null}
                    {claim.status === "adopted" && claim.provisionedRouterId ? (
                      <Badge tone="info">Provisioned</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-background-border p-6 text-sm text-text-muted">
                No onboarding claims yet. Generate a claim above to start the secure adoption flow.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function DirectProvisioningPanel({
  submitLabel = "Create Router",
  onCancel,
  onSuccess,
  initialUserId = "",
}: RouterAdminCreateFormProps) {
  const createRouterMutation = useCreateRouterAdmin();
  const [form, setForm] = useState<CreateRouterPayload>({
    userId: initialUserId,
    name: "",
    serverNode: "wireguard",
    reason: "",
  });
  const [inlineError, setInlineError] = useState<string | null>(null);

  useEffect(() => {
    setForm((current) => ({ ...current, userId: initialUserId }));
  }, [initialUserId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError(null);

    if (!form.userId.trim() || !form.name.trim()) {
      setInlineError("Customer user ID/email and router name are required.");
      return;
    }

    try {
      const router = await createRouterMutation.mutateAsync({
        userId: form.userId.trim(),
        name: form.name.trim(),
        serverNode: form.serverNode?.trim() || "wireguard",
        reason: form.reason?.trim() || undefined,
      });
      setForm({ userId: initialUserId, name: "", serverNode: "wireguard", reason: "" });
      onSuccess?.(router);
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to create router");
    }
  };

  return (
    <Card className="space-y-5">
      <CardHeader>
        <div>
          <CardTitle>Direct provisioning</CardTitle>
          <CardDescription>Fallback path. Creates the managed router immediately without waiting for a claim callback.</CardDescription>
        </div>
      </CardHeader>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Input
            label="Customer user ID or email"
            placeholder="subscriber@example.com"
            value={form.userId}
            onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value }))}
            leftIcon={<UserRound className="h-4 w-4" />}
            required
          />
          <Input
            label="Router name"
            placeholder="e.g. branch-office-nairobi"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            leftIcon={<Router className="h-4 w-4" />}
            required
          />
        </div>

        <Input
          label="Server node"
          placeholder="wireguard"
          hint="Leave as 'wireguard' unless using multi-node setup."
          value={form.serverNode}
          onChange={(event) => setForm((current) => ({ ...current, serverNode: event.target.value }))}
        />

        <Textarea
          label="Admin reason"
          placeholder="Why is this router being created directly?"
          value={form.reason}
          onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
        />

        {inlineError ? <InlineError message={inlineError} /> : null}

        {createRouterMutation.data ? (
          <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              <span>Router provisioned</span>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-text-secondary md:grid-cols-2">
              <p>VPN IP: <span className="font-mono text-text-primary">{createRouterMutation.data.vpnIp}</span></p>
              <p>Status: <span className="text-text-primary">{createRouterMutation.data.status}</span></p>
              <p>Winbox: <span className="font-mono text-text-primary">{createRouterMutation.data.ports.winbox}</span></p>
              <p>SSH/API: <span className="font-mono text-text-primary">{createRouterMutation.data.ports.ssh} / {createRouterMutation.data.ports.api}</span></p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          {onCancel ? <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button> : null}
          <Button type="submit" isLoading={createRouterMutation.isPending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function RouterAdminCreateForm({
  mode = "dialog",
  submitLabel = "Create Router",
  onCancel,
  onSuccess,
  initialUserId = "",
}: RouterAdminCreateFormProps) {
  const [tab, setTab] = useState<"discovery" | "claim" | "direct">("discovery");

  const content = (
    <div className="space-y-5">
      <Tabs
        tabs={[
          { label: "Discover on this network", value: "discovery" },
          { label: "Claim-based (Recommended)", value: "claim" },
          { label: "Direct provisioning", value: "direct" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "discovery" | "claim" | "direct")}
      />
      {tab === "discovery" ? (
        <RouterDiscoveryPanel initialUserId={initialUserId} onCancel={onCancel} onSuccess={onSuccess} />
      ) : tab === "claim" ? (
        <ClaimProvisioningPanel initialUserId={initialUserId} onCancel={onCancel} onSuccess={onSuccess} />
      ) : (
        <DirectProvisioningPanel mode={mode} submitLabel={submitLabel} onCancel={onCancel} onSuccess={onSuccess} initialUserId={initialUserId} />
      )}
    </div>
  );

  if (mode === "page") {
    return content;
  }

  return content;
}

export function AddRouterAdminDialog({ open, onClose, initialUserId = "" }: { open: boolean; onClose: () => void; initialUserId?: string }) {
  return (
    <Modal
      open={open}
      title="Add Router"
      description="Choose discovery-assisted import, claim-based onboarding, or direct provisioning depending on how the router can be reached."
      onClose={onClose}
      maxWidthClass="max-w-[min(98vw,88rem)]"
    >
      <RouterAdminCreateForm initialUserId={initialUserId} onCancel={onClose} onSuccess={() => onClose()} />
    </Modal>
  );
}
