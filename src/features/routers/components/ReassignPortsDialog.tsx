import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export function ReassignPortsDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { ports?: { winbox: number; ssh: number; api: number } | null; reason?: string }) => void;
}) {
  const [customPorts, setCustomPorts] = useState(false);
  const [winbox, setWinbox] = useState("");
  const [ssh, setSsh] = useState("");
  const [api, setApi] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setCustomPorts(false);
      setWinbox("");
      setSsh("");
      setApi("");
      setReason("");
    }
  }, [open]);

  const canSubmit = !customPorts || (winbox && ssh && api);

  return (
    <Modal open={open} title="Reassign router ports" description="Allocate fresh public access ports or set a manual port mapping for this router." onClose={onClose}>
      <Checkbox checked={customPorts} onChange={(event) => setCustomPorts(event.target.checked)} label="Specify custom ports instead of auto-allocation" />
      {customPorts ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Winbox port" value={winbox} onChange={(event) => setWinbox(event.target.value)} inputMode="numeric" />
          <Input label="SSH port" value={ssh} onChange={(event) => setSsh(event.target.value)} inputMode="numeric" />
          <Input label="API port" value={api} onChange={(event) => setApi(event.target.value)} inputMode="numeric" />
        </div>
      ) : null}
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason for the port reassignment" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          isLoading={loading}
          disabled={!canSubmit}
          onClick={() => onConfirm({
            ports: customPorts ? { winbox: Number(winbox), ssh: Number(ssh), api: Number(api) } : null,
            reason: reason.trim() || undefined,
          })}
        >
          Reassign ports
        </Button>
      </div>
    </Modal>
  );
}
