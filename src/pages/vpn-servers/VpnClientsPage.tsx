import { CheckCircle2, Copy, Download, KeyRound, Plus, RefreshCcw, Search, Server, ShieldX, Trash2, Wifi } from "lucide-react";
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
import type { CreateVpnClientPayload, UpdateVpnClientPayload, VpnClientDetail, VpnClientRow } from "@/features/vpn-clients/types/vpn-client.types";
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

export function VpnClientsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { copy } = useCopyToClipboard();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [enabled, setEnabled] = useState("all");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<VpnClientRow | null>(null);

  const createDisclosure = useDisclosure(false);
  const editDisclosure = useDisclosure(false);
  const deleteDisclosure = useDisclosure(false);
  const bulkDeleteDisclosure = useDisclosure(false);

  const listQuery = useVpnClients({ page, limit: PAGE_SIZE, search, enabled: enabled === "all" ? undefined : enabled });
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

  const rows = listQuery.data?.items || [];
  const pagination = listQuery.data?.pagination;

  useEffect(() => {
    if (!selectedClient && rows.length) {
      setSelectedClient(rows[0]);
    }
  }, [rows, selectedClient]);

  const selectedDetail = detailQuery.data;

  const columns = useMemo<ColumnDef<VpnClientRow>[]>(() => [
    {
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
      header: "Client",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-text-primary">{row.original.name}</p>
          <p className="text-xs text-text-secondary">{row.original.ip}</p>
        </div>
      ),
    },
    {
      header: "Status",
      cell: ({ row }) => <Badge tone={row.original.enabled ? "success" : "warning"}>{row.original.enabled ? "enabled" : "disabled"}</Badge>,
    },
    {
      header: "Traffic",
      cell: ({ row }) => <span className="text-text-secondary">{safeFormatBytes(row.original.transferRx)} / {safeFormatBytes(row.original.transferTx)}</span>,
    },
    {
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
              <Button variant="outline" leftIcon={<Trash2 className="h-4 w-4" />} disabled={!selectedNames.length} onClick={bulkDeleteDisclosure.onOpen}>Bulk Delete</Button>
              <RefreshButton loading={listQuery.isFetching} onClick={() => void listQuery.refetch()} />
            </div>
          </div>
        </CardHeader>

        <div className="grid gap-4 md:grid-cols-[1.6fr_0.7fr]">
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
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloadConfigMutation.isPending} onClick={() => downloadConfigMutation.mutate(selectedDetail.name)}>Download `.conf`</Button>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloadAutoconfigMutation.isPending} onClick={() => downloadAutoconfigMutation.mutate(selectedDetail.name)}>Download autoconfig</Button>
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />} isLoading={downloadMikrotikMutation.isPending} onClick={() => downloadMikrotikMutation.mutate(selectedDetail.name)}>Download MikroTik script</Button>
              <Button variant="outline" leftIcon={<Wifi className="h-4 w-4" />} isLoading={pingMutation.isPending} onClick={() => pingMutation.mutate({ name: selectedDetail.name })}>Ping client</Button>
              <Button variant="outline" leftIcon={<KeyRound className="h-4 w-4" />} isLoading={regenerateMutation.isPending} onClick={() => regenerateMutation.mutate([selectedDetail.name] as never)}>Regenerate keys</Button>
              {selectedDetail.enabled ? (
                <Button variant="ghost" leftIcon={<ShieldX className="h-4 w-4" />} isLoading={disableMutation.isPending} onClick={() => disableMutation.mutate([selectedDetail.name] as never)}>Disable</Button>
              ) : (
                <Button variant="ghost" leftIcon={<CheckCircle2 className="h-4 w-4" />} isLoading={enableMutation.isPending} onClick={() => enableMutation.mutate([selectedDetail.name] as never)}>Enable</Button>
              )}
              <Button variant="ghost" onClick={editDisclosure.onOpen}>Edit client</Button>
              <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={deleteDisclosure.onOpen}>Delete</Button>
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
          onSubmit={(payload) => updateMutation.mutate([selectedDetail.name, {
            notes: payload.notes,
            interfaceName: payload.interfaceName,
            allowedIPs: payload.allowedIPs,
            endpoint: payload.endpoint,
            dns: payload.dns,
            persistentKeepalive: payload.persistentKeepalive,
            enabled: payload.enabled,
            ip: "ip" in payload ? payload.ip : undefined,
          }] as never, { onSuccess: () => editDisclosure.onClose() })}
        />
      ) : null}

      <ConfirmDialog open={deleteDisclosure.open} title="Delete VPN client" description={`Remove ${selectedDetail?.name || "this client"} from WireGuard and delete its record.`} confirmLabel="Delete client" onClose={deleteDisclosure.onClose} onConfirm={() => { if (!selectedDetail) return; deleteMutation.mutate([selectedDetail.name] as never, { onSuccess: () => deleteDisclosure.onClose() }); }} />
      <ConfirmDialog open={bulkDeleteDisclosure.open} title="Bulk delete VPN clients" description={`Delete ${selectedNames.length} selected client records and remove their peers from WireGuard.`} confirmLabel="Delete selected" onClose={bulkDeleteDisclosure.onClose} onConfirm={() => bulkDeleteMutation.mutate([selectedNames] as never, { onSuccess: () => { setSelectedNames([]); bulkDeleteDisclosure.onClose(); } })} />
    </section>
  );
}
