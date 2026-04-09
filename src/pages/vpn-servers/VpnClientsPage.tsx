import { CheckCircle2, Copy, Download, ExternalLink, KeyRound, Link2Off, Plus, RefreshCcw, Search, Server, ShieldX, Trash2, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { TableLoader } from "@/components/feedback/TableLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/data-display/DataTable";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { vpnServerManagementTabs } from "@/config/module-tabs";
import { appRoutes } from "@/config/routes";
import {
  useBulkDeleteVpnClients,
  useCreateVpnClient,
  useDeleteVpnClient,
  useDisableVpnClient,
  useDownloadVpnClientAutoconfig,
  useDownloadVpnClientConfig,
  useDownloadVpnClientMikrotik,
  useEnableVpnClient,
  usePingVpnClient,
  useRegenerateVpnClientKeys,
  useUpdateVpnClient,
  useVpnClient,
  useVpnClients,
} from "@/features/vpn-clients/hooks/useVpnClients";
import type { CreateVpnClientPayload, UpdateVpnClientPayload, VpnClientRow } from "@/features/vpn-clients/types/vpn-client.types";
import { useUnlinkRouterClient } from "@/features/routers/hooks/useRouter";
import { useCopyToClipboard } from "@/hooks/utils/useCopyToClipboard";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatDateTime } from "@/lib/formatters/date";
import { formatBytes } from "@/lib/formatters/bytes";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_SIZE = 25;

function safeFormatBytes(value?: number) {
  return value ? formatBytes(value) : "0 B";
}

function pingTone(message?: string) {
  return message?.toLowerCase().includes("successful") ? "success" : "warning";
}

function ClientForm({
  title,
  description,
  loading,
  initialValues,
  onClose,
  onSubmit,
}: {
  title: string;
  description: string;
  loading?: boolean;
  initialValues: CreateVpnClientPayload & { ip?: string };
  onClose: () => void;
  onSubmit: (payload: CreateVpnClientPayload | UpdateVpnClientPayload) => void;
}) {
  const [values, setValues] = useState(initialValues);

  useEffect(() => setValues(initialValues), [initialValues]);

  return (
    <Modal open title={title} description={description} onClose={onClose} maxWidthClass="max-w-[min(96vw,48rem)]">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Client name" value={values.name || ""} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} />
        <Input label="Interface name" value={values.interfaceName || ""} onChange={(event) => setValues((current) => ({ ...current, interfaceName: event.target.value }))} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Endpoint" value={values.endpoint || ""} onChange={(event) => setValues((current) => ({ ...current, endpoint: event.target.value }))} />
        <Input label="Allowed IPs" value={values.allowedIPs || ""} onChange={(event) => setValues((current) => ({ ...current, allowedIPs: event.target.value }))} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="DNS" value={values.dns || ""} onChange={(event) => setValues((current) => ({ ...current, dns: event.target.value }))} />
        <Input label="Keepalive" type="number" min="0" value={String(values.persistentKeepalive || 25)} onChange={(event) => setValues((current) => ({ ...current, persistentKeepalive: Number(event.target.value) || 25 }))} />
      </div>
      {"ip" in values ? <Input label="Tunnel IP" value={values.ip || ""} onChange={(event) => setValues((current) => ({ ...current, ip: event.target.value }))} /> : null}
      <Textarea label="Notes" rows={4} value={values.notes || ""} onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))} />
      <div className="rounded-2xl border border-background-border bg-background-panel px-4 py-4">
        <Checkbox checked={Boolean(values.enabled)} onChange={(event) => setValues((current) => ({ ...current, enabled: event.target.checked }))} label="Enabled on save" />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onSubmit(values)}>{title}</Button>
      </div>
    </Modal>
  );
}

function PingClientDialog({
  loading,
  defaultTarget,
  onClose,
  onSubmit,
}: {
  loading?: boolean;
  defaultTarget?: string | null;
  onClose: () => void;
  onSubmit: (payload: { target?: string; count: number }) => void;
}) {
  const [target, setTarget] = useState(defaultTarget || "");
  const [count, setCount] = useState("3");

  useEffect(() => setTarget(defaultTarget || ""), [defaultTarget]);

  return (
    <Modal open title="Ping client" description="Optionally override the target IP and probe count before running the connectivity test." onClose={onClose} maxWidthClass="max-w-[min(96vw,30rem)]">
      <div className="grid gap-4">
        <Input label="Target IP" value={target} placeholder="Leave blank to use the client tunnel IP" onChange={(event) => setTarget(event.target.value)} />
        <Input label="Probe count" type="number" min="1" max="10" value={count} onChange={(event) => setCount(event.target.value)} />
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onSubmit({ target: target.trim() || undefined, count: Math.max(1, Number(count) || 3) })}>Run ping</Button>
      </div>
    </Modal>
  );
}

function MikrotikScriptDialog({
  loading,
  initialIface,
  initialSubnet,
  onClose,
  onSubmit,
}: {
  loading?: boolean;
  initialIface?: string;
  initialSubnet?: string;
  onClose: () => void;
  onSubmit: (payload: { iface?: string; subnet?: string }) => void;
}) {
  const [iface, setIface] = useState(initialIface || "");
  const [subnet, setSubnet] = useState(initialSubnet || "");

  useEffect(() => setIface(initialIface || ""), [initialIface]);
  useEffect(() => setSubnet(initialSubnet || ""), [initialSubnet]);

  return (
    <Modal open title="MikroTik script options" description="Override the generated interface name or subnet before downloading the script." onClose={onClose} maxWidthClass="max-w-[min(96vw,30rem)]">
      <div className="grid gap-4">
        <Input label="Interface override" value={iface} placeholder="Optional interface name" onChange={(event) => setIface(event.target.value)} />
        <Input label="Subnet override" value={subnet} placeholder="Optional subnet such as 10.0.0.0/24" onChange={(event) => setSubnet(event.target.value)} />
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={loading} onClick={() => onSubmit({ iface: iface.trim() || undefined, subnet: subnet.trim() || undefined })}>Download script</Button>
      </div>
    </Modal>
  );
}

export function VpnClientsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { copy } = useCopyToClipboard();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<VpnClientRow | null>(null);
  const [pingDialogOpen, setPingDialogOpen] = useState(false);
  const [mikrotikDialogOpen, setMikrotikDialogOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ id: string; name: string } | null>(null);

  const createDisclosure = useDisclosure(false);
  const editDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const bulkDeleteDisclosure = useDisclosure(false);

  const listQuery = useVpnClients({ page, limit: PAGE_SIZE, search, enabled: enabled === "all" ? undefined : enabled, sortBy, sortOrder });
  const detailQuery = useVpnClient(selectedClient?.name || "");

  const createMutation = useCreateVpnClient();
  const updateMutation = useUpdateVpnClient();
  const enableMutation = useEnableVpnClient();
  const disableMutation = useDisableVpnClient();
  const deleteMutation = useDeleteVpnClient();
  const bulkDeleteMutation = useBulkDeleteVpnClients();
  const regenerateMutation = useRegenerateVpnClientKeys();
  const pingMutation = usePingVpnClient();
  const downloadConfigMutation = useDownloadVpnClientConfig();
  const downloadAutoconfigMutation = useDownloadVpnClientAutoconfig();
  const downloadMikrotikMutation = useDownloadVpnClientMikrotik();
  const unlinkRouterClientMutation = useUnlinkRouterClient();

  const rows = useMemo(() => listQuery.data?.items || [], [listQuery.data?.items]);
  const pagination = listQuery.data?.pagination;
  const selectedDetail = detailQuery.data;
  const selectedClientLinkedRouters = selectedDetail?.linkedRouters || [];
  const selectedClientDeleteBlocked = selectedClientLinkedRouters.length > 0;
  const bulkDeleteBlocked = selectedNames.some((name) => rows.find((row) => row.name === name)?.linkedRouterCount);

  useEffect(() => {
    if (!selectedClient && rows.length) {
      setSelectedClient(rows[0]);
    }
  }, [rows, selectedClient]);

  const columns = useMemo<ColumnDef<VpnClientRow>[]>(() => [
    {
      id: "select",
      header: "",
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedNames.includes(row.original.name)}
          onChange={(event) => {
            event.stopPropagation();
            setSelectedNames((current) => event.target.checked ? [...current, row.original.name] : current.filter((item) => item !== row.original.name));
          }}
        />
      ),
    },
    {
      id: "client",
      header: "Client",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.name}</p>
          <p className="text-xs text-text-secondary">{row.original.ip}</p>
          {row.original.linkedRouterCount ? <p className="text-xs text-text-secondary">{row.original.linkedRouterCount} linked router{row.original.linkedRouterCount === 1 ? "" : "s"}</p> : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <Badge tone={row.original.enabled ? "success" : "warning"}>{row.original.enabled ? "enabled" : "disabled"}</Badge>,
    },
    {
      id: "traffic",
      header: "Traffic",
      cell: ({ row }) => <span className="text-text-secondary">{safeFormatBytes(row.original.transferRx)} / {safeFormatBytes(row.original.transferTx)}</span>,
    },
    {
      id: "lastHandshake",
      header: "Last handshake",
      cell: ({ row }) => <span className="text-text-secondary">{row.original.lastHandshake ? formatDateTime(row.original.lastHandshake) : "Never"}</span>,
    },
  ], [selectedNames]);

  if (listQuery.isPending) return <TableLoader />;

  if (listQuery.isError || !listQuery.data) {
    return <ErrorState title="Unable to load VPN clients" description="Retry after confirming the WireGuard client endpoints are available." onAction={() => void listQuery.refetch()} />;
  }

  const totalPages = Math.max(1, pagination?.pages || 1);
  const enabledCount = rows.filter((item) => item.enabled).length;

  return (
    <section className="space-y-6">
      <PageHeader title="VPN Client Management" description="Manage raw WireGuard client peers, export configs and MikroTik scripts, and perform lifecycle actions directly from the admin panel." meta={`${pagination?.total || 0} total clients`} />

      <Tabs tabs={[...vpnServerManagementTabs]} value={location.pathname} onChange={navigate} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><div className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Visible clients</p><p className="mt-2 text-3xl font-semibold text-text-primary">{rows.length}</p></div></Card>
        <Card><div className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Enabled</p><p className="mt-2 text-3xl font-semibold text-text-primary">{enabledCount}</p></div></Card>
        <Card><div className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Selected</p><p className="mt-2 text-3xl font-semibold text-text-primary">{selectedNames.length}</p></div></Card>
        <Card><div className="p-5"><p className="text-xs uppercase tracking-[0.18em] text-text-muted">Key rotations</p><p className="mt-2 text-3xl font-semibold text-text-primary">{rows.filter((item) => item.lastHandshake == null).length}</p></div></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>VPN clients directory</CardTitle>
              <CardDescription>Search, filter, export, and manage all WireGuard clients from one workspace.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button leftIcon={<Plus className="h-4 w-4" />} onClick={createDisclosure.onOpen}>Create Client</Button>
              <Button variant="outline" leftIcon={<Trash2 className="h-4 w-4" />} disabled={!selectedNames.length || bulkDeleteBlocked} onClick={bulkDeleteDisclosure.onOpen}>Bulk Delete</Button>
              <RefreshButton loading={listQuery.isFetching} onClick={() => void listQuery.refetch()} />
            </div>
          </div>
        </CardHeader>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input label="Search" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Search client name, notes, or tunnel IP" leftIcon={<Search className="h-4 w-4" />} />
          <Select
            label="Enabled state"
            value={enabled}
            onChange={(event) => { setPage(1); setEnabled(event.target.value); }}
            options={[
              { label: "All clients", value: "all" },
              { label: "Enabled only", value: "true" },
              { label: "Disabled only", value: "false" },
            ]}
          />
          <Select
            label="Sort by"
            value={sortBy}
            onChange={(event) => { setPage(1); setSortBy(event.target.value); }}
            options={[
              { label: "Created time", value: "createdAt" },
              { label: "Updated time", value: "updatedAt" },
              { label: "Client name", value: "name" },
              { label: "Last handshake", value: "lastHandshake" },
            ]}
          />
          <Select
            label="Sort order"
            value={sortOrder}
            onChange={(event) => { setPage(1); setSortOrder(event.target.value as "asc" | "desc"); }}
            options={[
              { label: "Descending", value: "desc" },
              { label: "Ascending", value: "asc" },
            ]}
          />
        </div>

        <div className="mt-5">
          <DataTable
            data={rows}
            columns={columns}
            onRowClick={(row) => setSelectedClient(row)}
            emptyTitle="No VPN clients found"
            emptyDescription="Create a WireGuard client or clear the filters to populate this directory."
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-background-border pt-4">
          <p className="text-sm text-text-secondary">Showing page {pagination?.page || 1} of {totalPages} with {pagination?.total || 0} total clients.</p>
          <div className="flex gap-3">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
          </div>
        </div>
        {selectedNames.length && bulkDeleteBlocked ? (
          <p className="px-6 pb-6 text-sm text-text-secondary">Bulk delete is blocked because one or more selected clients are still linked to routers. Unlink those routers first.</p>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Client action desk</CardTitle>
              <CardDescription>Inspect a selected peer, rotate keys, test reachability, and export deployment assets.</CardDescription>
            </div>
            {selectedClient ? <Button variant="outline" leftIcon={<RefreshCcw className="h-4 w-4" />} onClick={() => void detailQuery.refetch()}>Refresh detail</Button> : null}
          </div>
        </CardHeader>

        {!selectedClient ? (
          <EmptyState icon={Server} title="No client selected" description="Select a VPN client from the table to review its peer details and management actions." />
        ) : detailQuery.isPending ? (
          <TableLoader />
        ) : detailQuery.isError || !selectedDetail ? (
          <ErrorState title="Unable to load client detail" description="Retry after confirming the selected client detail endpoint is available." onAction={() => void detailQuery.refetch()} />
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-text-primary">{selectedDetail.name}</p>
                    <p className="text-sm text-text-secondary">{selectedDetail.ip} • {selectedDetail.interfaceName || "No interface label"}</p>
                  </div>
                  <Badge tone={selectedDetail.enabled ? "success" : "warning"}>{selectedDetail.enabled ? "enabled" : "disabled"}</Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-background-border bg-background-panel p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Public key</p>
                    <p className="mt-2 break-all font-mono text-sm text-text-primary">{selectedDetail.publicKey}</p>
                    <Button className="mt-3" variant="outline" onClick={() => void copy(selectedDetail.publicKey, "Public key copied")} leftIcon={<Copy className="h-4 w-4" />}>Copy</Button>
                  </div>
                  <div className="rounded-xl border border-background-border bg-background-panel p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Private key</p>
                    <p className="mt-2 break-all font-mono text-sm text-text-primary">{selectedDetail.privateKey || "Hidden"}</p>
                    {selectedDetail.privateKey ? <Button className="mt-3" variant="outline" onClick={() => void copy(selectedDetail.privateKey || "", "Private key copied")} leftIcon={<Copy className="h-4 w-4" />}>Copy</Button> : null}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
                <p className="text-sm font-medium text-text-primary">Peer state</p>
                <div className="mt-3 space-y-3 text-sm">
                  <p className="text-text-secondary">Endpoint: <span className="text-text-primary">{selectedDetail.endpoint || "Not set"}</span></p>
                  <p className="text-text-secondary">Allowed IPs: <span className="text-text-primary">{selectedDetail.allowedIPs || "Not set"}</span></p>
                  <p className="text-text-secondary">DNS: <span className="text-text-primary">{selectedDetail.dns || "Not set"}</span></p>
                  <p className="text-text-secondary">Keepalive: <span className="text-text-primary">{selectedDetail.persistentKeepalive ?? "—"}</span></p>
                  <p className="text-text-secondary">Last handshake: <span className="text-text-primary">{selectedDetail.lastHandshake ? formatDateTime(selectedDetail.lastHandshake) : "Never"}</span></p>
                  <p className="text-text-secondary">Last connection IP: <span className="text-text-primary">{selectedDetail.lastConnectionIp || "Unknown"}</span></p>
                  <p className="text-text-secondary">Traffic: <span className="text-text-primary">{safeFormatBytes(selectedDetail.transferRx)} RX / {safeFormatBytes(selectedDetail.transferTx)} TX</span></p>
                  <p className="text-text-secondary">Linked routers: <span className="text-text-primary">{selectedClientLinkedRouters.length}</span></p>
                </div>
              </div>
            </div>

            {selectedClientLinkedRouters.length ? (
              <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
                <p className="text-sm font-medium text-text-primary">Assigned routers</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {selectedClientLinkedRouters.map((router) => (
                    <div key={router._id} className="rounded-xl border border-background-border bg-background-panel p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-medium text-text-primary">{router.name}</p>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" leftIcon={<ExternalLink className="h-4 w-4" />} onClick={() => navigate(appRoutes.routerDetail(router._id))}>Open router</Button>
                          <Button size="sm" variant="ghost" leftIcon={<Link2Off className="h-4 w-4" />} isLoading={unlinkRouterClientMutation.isPending && unlinkTarget?.id === router._id} onClick={() => setUnlinkTarget({ id: router._id, name: router.name })}>Unlink</Button>
                        </div>
                      </div>
                      <p className="mt-1 text-text-secondary">Status: <span className="text-text-primary">{router.status}</span></p>
                      <p className="text-text-secondary">VPN IP: <span className="text-text-primary">{router.vpnIp || "Unknown"}</span></p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-text-secondary">Delete is disabled while this client is assigned to routers so we do not leave broken management references behind.</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloadConfigMutation.isPending} onClick={() => downloadConfigMutation.mutate(selectedDetail.name)}>Download `.conf`</Button>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloadAutoconfigMutation.isPending} onClick={() => downloadAutoconfigMutation.mutate(selectedDetail.name)}>Download autoconfig</Button>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloadMikrotikMutation.isPending} onClick={() => setMikrotikDialogOpen(true)}>Download MikroTik script</Button>
              <Button variant="outline" leftIcon={<Wifi className="h-4 w-4" />} isLoading={pingMutation.isPending} onClick={() => setPingDialogOpen(true)}>Ping client</Button>
              <Button variant="outline" leftIcon={<KeyRound className="h-4 w-4" />} isLoading={regenerateMutation.isPending} onClick={() => regenerateMutation.mutate([selectedDetail.name] as never)}>Regenerate keys</Button>
              {selectedDetail.enabled ? (
                <Button variant="ghost" leftIcon={<ShieldX className="h-4 w-4" />} isLoading={disableMutation.isPending} onClick={() => disableMutation.mutate([selectedDetail.name] as never)}>Disable</Button>
              ) : (
                <Button variant="ghost" leftIcon={<CheckCircle2 className="h-4 w-4" />} isLoading={enableMutation.isPending} onClick={() => enableMutation.mutate([selectedDetail.name] as never)}>Enable</Button>
              )}
              <Button variant="ghost" onClick={editDisclosure.onOpen}>Edit client</Button>
              <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} disabled={selectedClientDeleteBlocked} onClick={deleteDisclosure.onOpen}>Delete</Button>
            </div>

            {pingMutation.data ? (
              <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
                <div className="flex items-center gap-2">
                  <Badge tone={pingTone(pingMutation.data.message) as "success" | "warning"}>{pingMutation.data.target}</Badge>
                  <span className="text-sm text-text-primary">{pingMutation.data.message}</span>
                </div>
                {pingMutation.data.result ? <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-xl bg-background-panel p-3 text-xs text-text-primary">{pingMutation.data.result}</pre> : null}
              </div>
            ) : null}
          </div>
        )}
      </Card>

      {createDisclosure.open ? (
        <ClientForm
          title="Create client"
          description="Create a raw WireGuard client peer and make it available for config export and MikroTik deployment."
          loading={createMutation.isPending}
          initialValues={{ name: "", notes: "", interfaceName: "", allowedIPs: "0.0.0.0/0", endpoint: "", dns: "8.8.8.8,1.1.1.1", persistentKeepalive: 25, enabled: true }}
          onClose={createDisclosure.onClose}
          onSubmit={(payload) => createMutation.mutate(payload as CreateVpnClientPayload, { onSuccess: () => createDisclosure.onClose() })}
        />
      ) : null}

      {editDisclosure.open && selectedDetail ? (
        <ClientForm
          title="Update client"
          description="Update peer metadata, addressing, allowed IPs, and enabled state for the selected WireGuard client."
          loading={updateMutation.isPending}
          initialValues={{
            name: selectedDetail.name,
            notes: selectedDetail.notes || "",
            interfaceName: selectedDetail.interfaceName || "",
            allowedIPs: selectedDetail.allowedIPs || "",
            endpoint: selectedDetail.endpoint || "",
            dns: selectedDetail.dns || "",
            persistentKeepalive: selectedDetail.persistentKeepalive || 25,
            enabled: selectedDetail.enabled,
            ip: selectedDetail.ip,
          }}
          onClose={editDisclosure.onClose}
          onSubmit={(payload) => updateMutation.mutate({
            name: selectedDetail.name,
            payload: {
              name: payload.name,
              notes: payload.notes,
              interfaceName: payload.interfaceName,
              allowedIPs: payload.allowedIPs,
              endpoint: payload.endpoint,
              dns: payload.dns,
              persistentKeepalive: payload.persistentKeepalive,
              enabled: payload.enabled,
              ip: "ip" in payload ? payload.ip : undefined,
            },
          }, {
            onSuccess: (data) => {
              setSelectedClient(data.data);
              editDisclosure.onClose();
            },
          })}
        />
      ) : null}

      {pingDialogOpen && selectedDetail ? (
        <PingClientDialog
          loading={pingMutation.isPending}
          defaultTarget={selectedDetail.ip?.split("/")[0] || ""}
          onClose={() => setPingDialogOpen(false)}
          onSubmit={({ target, count }) => pingMutation.mutate({ name: selectedDetail.name, target, count }, { onSuccess: () => setPingDialogOpen(false) })}
        />
      ) : null}

      {mikrotikDialogOpen && selectedDetail ? (
        <MikrotikScriptDialog
          loading={downloadMikrotikMutation.isPending}
          initialIface={selectedDetail.interfaceName || ""}
          initialSubnet={selectedDetail.allowedIPs || ""}
          onClose={() => setMikrotikDialogOpen(false)}
          onSubmit={({ iface, subnet }) => downloadMikrotikMutation.mutate({ name: selectedDetail.name, iface, subnet }, { onSuccess: () => setMikrotikDialogOpen(false) })}
        />
      ) : null}

      <ConfirmDialog open={deleteDisclosure.open} title="Delete VPN client" description={`Remove ${selectedDetail?.name || "this client"} from WireGuard and delete its record.`} confirmLabel="Delete client" onClose={deleteDisclosure.onClose} onConfirm={() => { if (!selectedDetail) return; deleteMutation.mutate([selectedDetail.name] as never, { onSuccess: () => deleteDisclosure.onClose() }); }} />
      <ConfirmDialog open={bulkDeleteDisclosure.open} title="Bulk delete VPN clients" description={`Delete ${selectedNames.length} selected client records and remove their peers from WireGuard.`} confirmLabel="Delete selected" onClose={bulkDeleteDisclosure.onClose} onConfirm={() => bulkDeleteMutation.mutate([selectedNames] as never, { onSuccess: () => { setSelectedNames([]); bulkDeleteDisclosure.onClose(); } })} />
      <ConfirmDialog
        open={Boolean(unlinkTarget)}
        title="Unlink router from client"
        description={`Remove ${unlinkTarget?.name || "this router"} from this VPN client's linked routers. The router record will stay in the system, but its direct WireGuard client assignment will be cleared.`}
        confirmLabel="Unlink router"
        onClose={() => setUnlinkTarget(null)}
        onConfirm={() => {
          if (!unlinkTarget) return;
          unlinkRouterClientMutation.mutate({ id: unlinkTarget.id }, {
            onSuccess: async () => {
              await detailQuery.refetch();
              setUnlinkTarget(null);
            },
          });
        }}
      />
    </section>
  );
}
