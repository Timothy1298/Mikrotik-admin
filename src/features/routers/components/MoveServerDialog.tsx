import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export function MoveServerDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { targetServerNode: string; reason?: string }) => void;
}) {
  const [targetServerNode, setTargetServerNode] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setTargetServerNode("");
      setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Move router server" description="Request a server-node move for this router. The backend will validate whether the infrastructure supports it." onClose={onClose}>
      <Input label="Target server node" value={targetServerNode} onChange={(event) => setTargetServerNode(event.target.value)} placeholder="wireguard-2" />
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why are you requesting this move?" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} disabled={!targetServerNode.trim()} onClick={() => onConfirm({ targetServerNode: targetServerNode.trim(), reason: reason.trim() || undefined })}>Move router</Button>
      </div>
    </Modal>
  );
}
