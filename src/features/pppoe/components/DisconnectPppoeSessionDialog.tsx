import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { PppoeSession } from "@/features/pppoe/types/pppoe.types";

export function DisconnectPppoeSessionDialog({
  open,
  session,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  session: PppoeSession | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Disconnect PPPoE session" description="Terminate the selected PPPoE subscriber session immediately from the router.">
      <div className="rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-sm text-slate-300">
        {session ? (
          <p>
            Disconnect <span className="font-medium text-slate-100">{session.name || "unknown subscriber"}</span> on{" "}
            <span className="font-mono text-slate-100">{session.address || "unknown IP"}</span>.
          </p>
        ) : <p>No session selected.</p>}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" isLoading={loading} onClick={onConfirm} disabled={!session}>Disconnect session</Button>
      </div>
    </Modal>
  );
}
