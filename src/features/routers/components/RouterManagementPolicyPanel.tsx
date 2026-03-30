import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import type { RouterDetail, RouterManagementPolicyProfile } from "@/features/routers/types/router.types";

const profileOptions: Array<{ label: string; value: Exclude<RouterManagementPolicyProfile, "custom"> }> = [
  { label: "Queue only", value: "queue_only" },
  { label: "Service admin", value: "service_admin" },
  { label: "Full remote admin", value: "full_remote_admin" },
];

const profileDescriptions: Record<Exclude<RouterManagementPolicyProfile, "custom">, string> = {
  queue_only: "Allows queue and bandwidth changes while keeping broader router writes blocked.",
  service_admin: "Allows service-level writes such as queues, hotspot, PPPoE, and interface service changes.",
  full_remote_admin: "Allows broader remote administration, including firewall, routes, interfaces, and service changes.",
};

function inferPolicyProfile(router: RouterDetail): RouterManagementPolicyProfile {
  const explicitProfile = router.policy?.profile;
  if (explicitProfile) return explicitProfile;

  const defaultMaxClass = router.policy?.defaultMaxClass;
  const allowNetworkCoreWrites = Boolean(router.policy?.allowNetworkCoreWrites);
  const approvedScopes = router.policy?.approvedScopes || [];

  if (defaultMaxClass === "network_core_mutation" && allowNetworkCoreWrites) {
    return "full_remote_admin";
  }

  const scopeSet = new Set(approvedScopes);
  if (
    defaultMaxClass === "service_mutation"
    && !allowNetworkCoreWrites
    && ["queues", "hotspot", "pppoe", "interfaces"].every((scope) => scopeSet.has(scope))
  ) {
    return "service_admin";
  }

  if (
    defaultMaxClass === "service_mutation"
    && !allowNetworkCoreWrites
    && approvedScopes.length === 1
    && approvedScopes[0] === "queues"
  ) {
    return "queue_only";
  }

  return "custom";
}

export function RouterManagementPolicyPanel({
  router,
  saving = false,
  onSave,
}: {
  router: RouterDetail;
  saving?: boolean;
  onSave: (profile: Exclude<RouterManagementPolicyProfile, "custom">) => void;
}) {
  const policyProfile = inferPolicyProfile(router);
  const currentProfile = policyProfile === "custom" ? "full_remote_admin" : policyProfile;
  const [selectedProfile, setSelectedProfile] = useState<Exclude<RouterManagementPolicyProfile, "custom">>(currentProfile);

  useEffect(() => {
    setSelectedProfile(currentProfile);
  }, [currentProfile]);

  if (router.profile.connectionMode !== "management_only") {
    return null;
  }

  const currentDescription = policyProfile === "custom"
    ? "This router has a custom management policy. Saving here will replace it with one of the supported presets."
    : profileDescriptions[currentProfile];

  return (
    <Card className="space-y-4">
      <CardHeader className="mb-0">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Remote Admin Policy</CardTitle>
            <Badge tone={policyProfile === "full_remote_admin" ? "success" : "info"}>
              {policyProfile === "custom" ? "custom" : String(policyProfile).replace(/_/g, " ")}
            </Badge>
          </div>
          <CardDescription>
            Choose how much write access this management-only router should allow over direct API or SSH access.
          </CardDescription>
        </div>
      </CardHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <Select
          label="Policy preset"
          value={selectedProfile}
          onChange={(event) => setSelectedProfile(event.target.value as Exclude<RouterManagementPolicyProfile, "custom">)}
          options={profileOptions}
        />
        <Button
          variant="outline"
          isLoading={saving}
          disabled={selectedProfile === currentProfile && policyProfile !== "custom"}
          onClick={() => onSave(selectedProfile)}
        >
          Save policy
        </Button>
      </div>

      <div className="rounded-2xl border border-background-border bg-background-panel p-4 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">Current behavior</p>
        <p className="mt-2">{currentDescription}</p>
        <p className="mt-3">Allowed scopes: {router.policy?.approvedScopes?.length ? router.policy.approvedScopes.join(", ") : "none"}</p>
        <p className="mt-1">Max command class: {router.policy?.defaultMaxClass || "service_mutation"}</p>
        <p className="mt-1">Network core writes: {router.policy?.allowNetworkCoreWrites ? "enabled" : "blocked"}</p>
      </div>
    </Card>
  );
}
