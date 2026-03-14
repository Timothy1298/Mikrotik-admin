import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

export function AddVpnServerDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { nodeId: string; name: string; region?: string; hostname?: string; endpoint?: string; maxPeers?: number; maxRouters?: number; reason?: string }) => void;
}) {
  const [nodeId, setNodeId] = useState("");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [hostname, setHostname] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [maxPeers, setMaxPeers] = useState("");
  const [maxRouters, setMaxRouters] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setNodeId(""); setName(""); setRegion(""); setHostname(""); setEndpoint(""); setMaxPeers(""); setMaxRouters(""); setReason("");
    }
  }, [open]);

  return (
    <Modal open={open} title="Add VPN server" description="Register a new VPN infrastructure node in the admin control plane." onClose={onClose}>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Node ID" value={nodeId} onChange={(event) => setNodeId(event.target.value)} placeholder="wireguard-2" />
        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="EU West Node" />
        <Input label="Region" value={region} onChange={(event) => setRegion(event.target.value)} placeholder="eu-west" />
        <Input label="Hostname" value={hostname} onChange={(event) => setHostname(event.target.value)} placeholder="vpn-eu-west.internal" />
        <Input label="Endpoint" value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="vpn.example.com:51820" />
        <Input label="Max peers" value={maxPeers} onChange={(event) => setMaxPeers(event.target.value)} inputMode="numeric" />
        <Input label="Max routers" value={maxRouters} onChange={(event) => setMaxRouters(event.target.value)} inputMode="numeric" />
      </div>
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this server being added?" />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} disabled={!nodeId.trim() || !name.trim()} onClick={() => onConfirm({ nodeId: nodeId.trim(), name: name.trim(), region: region.trim() || undefined, hostname: hostname.trim() || undefined, endpoint: endpoint.trim() || undefined, maxPeers: maxPeers ? Number(maxPeers) : undefined, maxRouters: maxRouters ? Number(maxRouters) : undefined, reason: reason.trim() || undefined })}>Add server</Button>
      </div>
    </Modal>
  );
}
