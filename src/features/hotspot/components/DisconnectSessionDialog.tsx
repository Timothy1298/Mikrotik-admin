import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { HotspotSession } from "@/features/hotspot/types/hotspot.types";

export function DisconnectSessionDialog({
  open,
  session,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  session: HotspotSession | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Disconnect hotspot session" description="Terminate the selected hotspot session immediately from the router.">
      <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-300">
        {session ? (
          <p>
            Disconnect <span className="font-medium text-slate-100">{session.username || "unknown user"}</span> at{" "}
            <span className="font-mono text-slate-100">{session.ip || "unknown IP"}</span>.
          </p>
        ) : (
          <p>No active session selected.</p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" isLoading={loading} onClick={onConfirm} disabled={!session}>
          Disconnect session
        </Button>
      </div>
    </Modal>
  );
}
