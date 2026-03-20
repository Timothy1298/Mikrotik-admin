import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { MoreHorizontal, Plus, Trash2, UserCog } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { DataTable } from "@/components/data-display/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useCreateAdminAccount, useDeactivateAdmin, useAdminAccounts, useActivateAdmin, useDeleteAdmin, useUpdateAdminAccount } from "@/features/settings/hooks";
import type { AdminAccount, CreateAdminPayload } from "@/features/settings/types/admin-management.types";
import { appRoutes } from "@/config/routes";
import { formatDateTime } from "@/lib/formatters/date";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";

function formatRole(role?: string | null) {
  if (!role) return "Legacy Admin";
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function ActionButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="rounded-lg border border-brand-500/15 px-2 py-1 text-xs text-slate-300 hover:bg-[rgba(37,99,235,0.08)]" {...props}>{children}</button>;
}

function CreateAdminDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateAdminAccount();
  const [form, setForm] = useState<CreateAdminPayload>({ name: "", email: "", password: "", adminRole: "support_admin", reason: "" });
  const [inlineError, setInlineError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || form.password.length < 6) {
      setInlineError("Name, email, role, and password are required.");
      return;
    }
    try {
      await createMutation.mutateAsync([{ ...form, name: form.name.trim(), email: form.email.trim() }] as never);
      setForm({ name: "", email: "", password: "", adminRole: "support_admin", reason: "" });
      setInlineError(null);
      onClose();
    } catch (error) {
      setInlineError(error instanceof Error ? error.message : "Failed to create admin");
    }
  };

  return (
    <Modal open={open} title="Add Admin" description="Create a new admin account and assign a scoped ISP control role." onClose={onClose}>
      <div className="space-y-4">
        <Input label="Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <PasswordInput label="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        <Select
          label="Admin Role"
          value={form.adminRole}
          onChange={(event) => setForm((current) => ({ ...current, adminRole: event.target.value }))}
          options={[
            { label: "Super Admin", value: "super_admin" },
            { label: "Network Admin", value: "network_admin" },
            { label: "Billing Admin", value: "billing_admin" },
            { label: "Support Admin", value: "support_admin" },
            { label: "Read Only", value: "read_only" },
          ]}
        />
        <Textarea label="Reason" value={form.reason || ""} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
        {inlineError ? <p className="text-sm text-danger">{inlineError}</p> : null}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button isLoading={createMutation.isPending} onClick={handleSubmit}>Create Admin</Button>
        </div>
      </div>
    </Modal>
  );
}

function EditAdminRoleDialog({ open, admin, onClose }: { open: boolean; admin: AdminAccount | null; onClose: () => void }) {
  const updateMutation = useUpdateAdminAccount();
  const [name, setName] = useState(admin?.name || "");
  const [adminRole, setAdminRole] = useState(admin?.adminRole || "support_admin");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setName(admin?.name || "");
    setAdminRole(admin?.adminRole || "support_admin");
    setReason("");
  }, [admin]);

  if (!admin) return null;

  const handleSubmit = async () => {
    await updateMutation.mutateAsync([admin.id, { name: name.trim(), adminRole, reason }] as never);
    onClose();
  };

  return (
    <Modal open={open} title="Edit Admin Account" description={`Update role or display name for ${admin.email}.`} onClose={onClose}>
      <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
      <Select
        label="Admin Role"
        value={adminRole}
        onChange={(event) => setAdminRole(event.target.value)}
        options={[
          { label: "Super Admin", value: "super_admin" },
          { label: "Network Admin", value: "network_admin" },
          { label: "Billing Admin", value: "billing_admin" },
          { label: "Support Admin", value: "support_admin" },
          { label: "Read Only", value: "read_only" },
        ]}
      />
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={updateMutation.isPending} onClick={handleSubmit}>Save Changes</Button>
      </div>
    </Modal>
  );
}

function DeleteAdminDialog({ open, admin, onClose }: { open: boolean; admin: AdminAccount | null; onClose: () => void }) {
  const deleteMutation = useDeleteAdmin();
  const [reason, setReason] = useState("");
  if (!admin) return null;

  const handleDelete = async () => {
    if (!reason.trim()) return;
    await deleteMutation.mutateAsync([admin.id, reason.trim()] as never);
    setReason("");
    onClose();
  };

  return (
    <Modal open={open} title="Delete Admin" description="Delete this admin account permanently. This action cannot be undone." onClose={onClose}>
      <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-slate-200">
        You are deleting <span className="font-semibold">{admin.email}</span>.
      </div>
      <Textarea label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" isLoading={deleteMutation.isPending} onClick={handleDelete}>Delete Admin</Button>
      </div>
    </Modal>
  );
}

export function AdminManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const adminsQuery = useAdminAccounts();
  const deactivateMutation = useDeactivateAdmin();
  const activateMutation = useActivateAdmin();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminAccount | null>(null);
  const canManage = can(currentUser || undefined, permissions.settingsManage);

  const metrics = useMemo(() => {
    const items = adminsQuery.data || [];
    const active = items.filter((item) => item.isActive).length;
    const deactivated = items.length - active;
    const rolesInUse = new Set(items.map((item) => item.adminRole).filter(Boolean)).size;
    return [
      { title: "Total Admins", value: String(items.length), progress: 100 },
      { title: "Active Admins", value: String(active), progress: items.length ? Math.round((active / items.length) * 100) : 0 },
      { title: "Roles in Use", value: String(rolesInUse), progress: Math.min(100, rolesInUse * 20) },
      { title: "Deactivated", value: String(deactivated), progress: items.length ? Math.round((deactivated / items.length) * 100) : 0 },
    ];
  }, [adminsQuery.data]);

  if (!canManage) {
    return <Navigate to={appRoutes.forbidden} replace />;
  }

  if (adminsQuery.isPending) return <SectionLoader />;
  if (adminsQuery.isError) {
    return <ErrorState title="Unable to load admin accounts" description="The admin-management endpoints could not be reached." onAction={() => void adminsQuery.refetch()} />;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Admin Accounts" description="Manage admin users, roles, and access permissions for the ISP control panel." />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>Add Admin</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.title} title={metric.title} value={metric.value} progress={metric.progress} />)}
      </div>

      <Card>
        <DataTable
          data={adminsQuery.data || []}
          columns={[
            {
              header: "Admin",
              cell: ({ row }) => (
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-100">{row.original.name}</p>
                    {currentUser?.id === row.original.id ? <Badge tone="info">You</Badge> : null}
                  </div>
                  <p className="text-sm text-slate-500">{row.original.email}</p>
                </div>
              ),
            },
            { header: "Role", cell: ({ row }) => <span className="text-sm text-slate-200">{formatRole(row.original.adminRole)}</span> },
            { header: "Status", cell: ({ row }) => <Badge tone={row.original.isActive ? "success" : "danger"}>{row.original.isActive ? "Active" : "Deactivated"}</Badge> },
            { header: "Last login", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : "Never"}</span> },
            { header: "Created", cell: ({ row }) => <span className="font-mono text-xs text-slate-400">{formatDateTime(row.original.createdAt)}</span> },
            {
              header: "Actions",
              cell: ({ row }) => {
                const isCurrent = currentUser?.id === row.original.id;
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    <ActionButton disabled={isCurrent} onClick={(event) => { event.stopPropagation(); setEditingAdmin(row.original); }}>Edit role</ActionButton>
                    {row.original.isActive ? (
                      <ActionButton disabled={isCurrent} onClick={(event) => { event.stopPropagation(); void deactivateMutation.mutateAsync([row.original.id, "Deactivated from admin management page"] as never); }}>Deactivate</ActionButton>
                    ) : (
                      <ActionButton onClick={(event) => { event.stopPropagation(); void activateMutation.mutateAsync([row.original.id, "Activated from admin management page"] as never); }}>Activate</ActionButton>
                    )}
                    <ActionButton disabled={isCurrent} onClick={(event) => { event.stopPropagation(); setDeletingAdmin(row.original); }}>
                      <span className="inline-flex items-center gap-1 text-danger"><Trash2 className="h-3.5 w-3.5" />Delete</span>
                    </ActionButton>
                  </div>
                );
              },
            },
          ]}
          emptyTitle="No admin accounts"
          emptyDescription="Create the first scoped admin to start enforcing role-based access."
        />
      </Card>

      <CreateAdminDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditAdminRoleDialog open={Boolean(editingAdmin)} admin={editingAdmin} onClose={() => setEditingAdmin(null)} />
      <DeleteAdminDialog open={Boolean(deletingAdmin)} admin={deletingAdmin} onClose={() => setDeletingAdmin(null)} />
    </section>
  );
}
