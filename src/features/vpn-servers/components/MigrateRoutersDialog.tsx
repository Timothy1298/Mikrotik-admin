import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export function MigrateRoutersDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { targetServerId: string; routerIds?: string[]; reason?: string }) => void;
}) {
  const [targetServerId, setTargetServerId] = useState("");
  const [routerIds, setRouterIds] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setTargetServerId("");
      setRouterIds("");
      setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Migrate routers" description="Request a router migration from this server to another target node." onClose={onClose}>
      <Input label="Target server ID" value={targetServerId} onChange={(event) => setTargetServerId(event.target.value)} placeholder="vpn-server-id" />
      <Textarea label="Router IDs" value={routerIds} onChange={(event) => setRouterIds(event.target.value)} placeholder="Optional comma-separated router IDs. Leave blank to request all eligible routers." />
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why are you requesting this migration?" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} disabled={!targetServerId.trim()} onClick={() => onConfirm({ targetServerId: targetServerId.trim(), routerIds: routerIds.trim() ? routerIds.split(",").map((item) => item.trim()).filter(Boolean) : undefined, reason: reason.trim() || undefined })}>Migrate routers</Button>
      </div>
    </Modal>
  );
}
