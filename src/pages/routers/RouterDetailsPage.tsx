import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { appRoutes } from "@/config/routes";
import {
  AddRouterFlagDialog,
  AddRouterNoteDialog,
  DeleteRouterDialog,
  DisableRouterDialog,
  MarkRouterReviewedDialog,
  MoveServerDialog,
  RebootRouterDialog,
  ReactivateRouterDialog,
  ReassignPortsDialog,
  RegenerateSetupDialog,
  ReprovisionRouterDialog,
  ResetPeerDialog,
  RemoveRouterFlagDialog,
  RouterDetailsWorkspace,
} from "@/features/routers/components";
import {
  useAddRouterFlag,
  useAddRouterNote,
  useDeleteRouter,
  useDisableRouter,
  useMarkRouterReviewed,
  useMoveRouterServer,
  useRebootRouter,
  useReactivateRouter,
  useReassignRouterPorts,
  useRegenerateRouterSetup,
  useRemoveRouterFlag,
  useReprovisionRouter,
  useResetRouterPeer,
  useRouter,
  useUpdateRouterManagementPolicy,
} from "@/features/routers/hooks/useRouter";
import type { RouterDetail } from "@/features/routers/types/router.types";
import { useDisclosure } from "@/hooks/ui/useDisclosure";

export function RouterDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [selectedFlag, setSelectedFlag] = useState<RouterDetail["flags"][number] | null>(null);
  const [setupArtifacts, setSetupArtifacts] = useState<import("@/features/routers/types/router.types").RouterSetupArtifacts | null>(null);
  const routerQuery = useRouter(id);

  const disableDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const reactivateDisclosure = useDisclosure(false);
  const reprovisionDisclosure = useDisclosure(false);
  const rebootDisclosure = useDisclosure(false);
  const regenerateDisclosure = useDisclosure(false);
  const resetPeerDisclosure = useDisclosure(false);
  const reassignPortsDisclosure = useDisclosure(false);
  const moveServerDisclosure = useDisclosure(false);
  const reviewedDisclosure = useDisclosure(false);
  const noteDisclosure = useDisclosure(false);
  const flagDisclosure = useDisclosure(false);
  const removeFlagDisclosure = useDisclosure(false);

  const disableMutation = useDisableRouter();
  const deleteMutation = useDeleteRouter();
  const reactivateMutation = useReactivateRouter();
  const reprovisionMutation = useReprovisionRouter();
  const rebootMutation = useRebootRouter();
  const regenerateMutation = useRegenerateRouterSetup();
  const resetPeerMutation = useResetRouterPeer();
  const reassignPortsMutation = useReassignRouterPorts();
  const moveServerMutation = useMoveRouterServer();
  const markReviewedMutation = useMarkRouterReviewed();
  const noteMutation = useAddRouterNote();
  const addFlagMutation = useAddRouterFlag();
  const removeFlagMutation = useRemoveRouterFlag();
  const updateManagementPolicyMutation = useUpdateRouterManagementPolicy();

  if (routerQuery.isPending) return <PageLoader />;
  if (routerQuery.isError || !routerQuery.data) {
    return <ErrorState title="Unable to load router" description="The router detail workspace could not be loaded. Retry after confirming the backend admin router API is available." onAction={() => void routerQuery.refetch()} />;
  }

  const router = routerQuery.data;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={router.profile.name} description="Route-driven router workspace for operational diagnostics, connectivity actions, and customer-impact context." meta={router.profile.vpnIp || undefined} />
        <RefreshButton loading={routerQuery.isFetching} onClick={() => void routerQuery.refetch()} />
      </div>

      <RouterDetailsWorkspace
        router={router}
        onRefresh={() => void routerQuery.refetch()}
        refreshing={routerQuery.isFetching}
        onDisable={disableDisclosure.onOpen}
        onDelete={deleteDisclosure.onOpen}
        onReactivate={reactivateDisclosure.onOpen}
        onReprovision={reprovisionDisclosure.onOpen}
        onReboot={rebootDisclosure.onOpen}
        onRegenerateSetup={regenerateDisclosure.onOpen}
        onResetPeer={resetPeerDisclosure.onOpen}
        onReassignPorts={reassignPortsDisclosure.onOpen}
        onMoveServer={moveServerDisclosure.onOpen}
        onMarkReviewed={reviewedDisclosure.onOpen}
        onAddNote={noteDisclosure.onOpen}
        onAddFlag={flagDisclosure.onOpen}
        onRemoveFlag={(flag) => { setSelectedFlag(flag); removeFlagDisclosure.onOpen(); }}
        onSaveManagementPolicy={(profile) => updateManagementPolicyMutation.mutate([router.id, { policyProfile: profile }] as never)}
        savingManagementPolicy={updateManagementPolicyMutation.isPending}
        setupArtifacts={setupArtifacts}
      />

      <DisableRouterDialog open={disableDisclosure.open} loading={disableMutation.isPending} onClose={disableDisclosure.onClose} onConfirm={(reason) => disableMutation.mutate([router.id, reason] as never, { onSuccess: () => disableDisclosure.onClose() })} />
      <DeleteRouterDialog open={deleteDisclosure.open} loading={deleteMutation.isPending} onClose={deleteDisclosure.onClose} onConfirm={(reason) => deleteMutation.mutate([router.id, reason] as never, { onSuccess: () => { deleteDisclosure.onClose(); navigate(appRoutes.routersAll); } })} />
      <ReactivateRouterDialog open={reactivateDisclosure.open} loading={reactivateMutation.isPending} onClose={reactivateDisclosure.onClose} onConfirm={(reason) => reactivateMutation.mutate([router.id, reason] as never, { onSuccess: () => reactivateDisclosure.onClose() })} />
      <ReprovisionRouterDialog open={reprovisionDisclosure.open} loading={reprovisionMutation.isPending} onClose={reprovisionDisclosure.onClose} onConfirm={(reason) => reprovisionMutation.mutate([router.id, reason] as never, { onSuccess: () => reprovisionDisclosure.onClose() })} />
      <RebootRouterDialog open={rebootDisclosure.open} loading={rebootMutation.isPending} onClose={rebootDisclosure.onClose} onConfirm={(reason) => rebootMutation.mutate([router.id, reason] as never, { onSuccess: () => rebootDisclosure.onClose() })} />
      <RegenerateSetupDialog open={regenerateDisclosure.open} loading={regenerateMutation.isPending} onClose={regenerateDisclosure.onClose} onConfirm={(reason) => regenerateMutation.mutate([router.id, reason] as never, { onSuccess: (result) => { setSetupArtifacts(result.artifacts || null); regenerateDisclosure.onClose(); } })} />
      <ResetPeerDialog open={resetPeerDisclosure.open} loading={resetPeerMutation.isPending} onClose={resetPeerDisclosure.onClose} onConfirm={(reason) => resetPeerMutation.mutate([router.id, reason] as never, { onSuccess: (result) => { setSetupArtifacts(result.artifacts || null); resetPeerDisclosure.onClose(); } })} />
      <ReassignPortsDialog open={reassignPortsDisclosure.open} loading={reassignPortsMutation.isPending} onClose={reassignPortsDisclosure.onClose} onConfirm={(payload) => reassignPortsMutation.mutate([router.id, payload] as never, { onSuccess: () => reassignPortsDisclosure.onClose() })} />
      <MoveServerDialog open={moveServerDisclosure.open} loading={moveServerMutation.isPending} onClose={moveServerDisclosure.onClose} onConfirm={(payload) => moveServerMutation.mutate([router.id, payload] as never, { onSuccess: () => moveServerDisclosure.onClose() })} />
      <MarkRouterReviewedDialog open={reviewedDisclosure.open} loading={markReviewedMutation.isPending} onClose={reviewedDisclosure.onClose} onConfirm={(reason) => markReviewedMutation.mutate([router.id, reason] as never, { onSuccess: () => reviewedDisclosure.onClose() })} />
      <AddRouterNoteDialog open={noteDisclosure.open} loading={noteMutation.isPending} onClose={noteDisclosure.onClose} onConfirm={(payload) => noteMutation.mutate([router.id, payload] as never, { onSuccess: () => noteDisclosure.onClose() })} />
      <AddRouterFlagDialog open={flagDisclosure.open} loading={addFlagMutation.isPending} onClose={flagDisclosure.onClose} onConfirm={(payload) => addFlagMutation.mutate([router.id, payload] as never, { onSuccess: () => flagDisclosure.onClose() })} />
      <RemoveRouterFlagDialog open={removeFlagDisclosure.open} loading={removeFlagMutation.isPending} flag={selectedFlag} onClose={removeFlagDisclosure.onClose} onConfirm={(reason) => {
        if (!selectedFlag?.id) return;
        removeFlagMutation.mutate([router.id, selectedFlag.id, reason] as never, { onSuccess: () => removeFlagDisclosure.onClose() });
      }} />
    </section>
  );
}
