import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Building2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { appRoutes } from "@/config/routes";
import { useRouters } from "@/features/routers/hooks/useRouters";
import { useCreateReseller, useDeactivateReseller, useDeleteReseller, useResellers, useUpdateReseller, useActivateReseller } from "@/features/settings/hooks";
import type { ResellerPayload, ResellerRecord } from "@/features/settings/types";
import { useServicePlans } from "@/features/service-plans/hooks/useServicePlans";
import { useUsers } from "@/features/users/hooks";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";
import { SettingsShell } from "@/pages/settings/components/SettingsShell";

const initialForm: ResellerPayload = {
  name: "",
  code: "",
  companyName: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  status: "active",
  territory: "",
  commissionRate: 0,
  priceOverridePercent: 0,
  notes: "",
  payoutBalance: 0,
  totalPaidOut: 0,
  lastPayoutReference: "",
  assignedUserIds: [],
  assignedRouterIds: [],
  assignedPlanIds: [],
  reason: "",
};

function ResellerDialog({
  open,
  reseller,
  onClose,
}: {
  open: boolean;
  reseller: ResellerRecord | null;
  onClose: () => void;
}) {
  const createMutation = useCreateReseller();
  const updateMutation = useUpdateReseller();
  const [form, setForm] = useState<ResellerPayload>(initialForm);
  const [userSearch, setUserSearch] = useState("");
  const [routerSearch, setRouterSearch] = useState("");
  const [planSearch, setPlanSearch] = useState("");
  const usersQuery = useUsers({ q: userSearch.trim() || undefined, page: 1, limit: 6 });
  const routersQuery = useRouters({ q: routerSearch.trim() || undefined, page: 1, limit: 6 });
  const plansQuery = useServicePlans({ q: planSearch.trim() || undefined });

  useEffect(() => {
    if (!open) return;
    if (!reseller) {
      setForm(initialForm);
      return;
    }
    setForm({
      name: reseller.name,
      code: reseller.code,
      companyName: reseller.companyName,
      contactName: reseller.contactName,
      contactEmail: reseller.contactEmail,
      contactPhone: reseller.contactPhone,
      status: reseller.status,
      territory: reseller.territory,
      commissionRate: reseller.commissionRate,
      priceOverridePercent: reseller.priceOverridePercent,
      notes: reseller.notes,
      payoutBalance: reseller.payoutBalance,
      totalPaidOut: reseller.totalPaidOut,
      lastPayoutAt: reseller.lastPayoutAt,
      lastPayoutReference: reseller.lastPayoutReference,
      assignedUserIds: reseller.assignedUsers.map((user) => user.id),
      assignedRouterIds: reseller.assignedRouters.map((router) => router.id),
      assignedPlanIds: reseller.assignedPlans.map((plan) => plan.id),
      reason: "",
    });
  }, [open, reseller]);

  const selectedUsers = useMemo(() => {
    const live = (usersQuery.data?.items || []).map((user) => ({ id: user.id, name: user.name, email: user.email, company: user.company }));
    const existing = reseller?.assignedUsers || [];
    const combined = [...existing, ...live];
    return (form.assignedUserIds || [])
      .map((id) => combined.find((user) => user.id === id))
      .filter((user): user is NonNullable<typeof user> => Boolean(user));
  }, [form.assignedUserIds, reseller?.assignedUsers, usersQuery.data?.items]);

  const selectedRouters = useMemo(() => {
    const live = (routersQuery.data?.items || []).map((router) => ({ id: router.id, name: router.name, routerId: router.id, status: router.status, vpnIp: router.vpnIp }));
    const existing = reseller?.assignedRouters || [];
    const combined = [...existing, ...live];
    return (form.assignedRouterIds || [])
      .map((id) => combined.find((router) => router.id === id))
      .filter((router): router is NonNullable<typeof router> => Boolean(router));
  }, [form.assignedRouterIds, reseller?.assignedRouters, routersQuery.data?.items]);

  const selectedPlans = useMemo(() => {
    const live = (plansQuery.data || []).map((plan) => ({ id: plan.id, name: plan.name, planType: plan.planType, price: plan.price, currency: plan.currency, isActive: plan.isActive }));
    const existing = reseller?.assignedPlans || [];
    const combined = [...existing, ...live];
    return (form.assignedPlanIds || [])
      .map((id) => combined.find((plan) => plan.id === id))
      .filter((plan): plan is NonNullable<typeof plan> => Boolean(plan));
  }, [form.assignedPlanIds, reseller?.assignedPlans, plansQuery.data]);

  const toggleSelection = (key: "assignedUserIds" | "assignedRouterIds" | "assignedPlanIds", id: string) => {
    setForm((current) => {
      const values = new Set(current[key] || []);
      if (values.has(id)) values.delete(id); else values.add(id);
      return { ...current, [key]: Array.from(values) };
    });
  };

  const submit = async () => {
    if (!form.name?.trim() || !form.code?.trim()) return;
    const payload: ResellerPayload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      companyName: form.companyName?.trim(),
      contactName: form.contactName?.trim(),
      contactEmail: form.contactEmail?.trim(),
      contactPhone: form.contactPhone?.trim(),
      territory: form.territory?.trim(),
      notes: form.notes?.trim(),
      lastPayoutReference: form.lastPayoutReference?.trim(),
      reason: form.reason?.trim() || undefined,
    };
    if (reseller) {
      await updateMutation.mutateAsync([reseller.id, payload] as never);
    } else {
      await createMutation.mutateAsync([payload] as never);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={reseller ? "Edit reseller" : "Create reseller"} description="Manage reseller identity, territory, payout controls, and allocated subscribers, routers, and plans." maxWidthClass="max-w-[min(96vw,78rem)]">
      <div className="grid gap-4 lg:grid-cols-2">
        <Input label="Name" value={form.name || ""} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <Input label="Code" value={form.code || ""} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
        <Input label="Company name" value={form.companyName || ""} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} />
        <Input label="Territory" value={form.territory || ""} onChange={(event) => setForm((current) => ({ ...current, territory: event.target.value }))} />
        <Input label="Contact name" value={form.contactName || ""} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} />
        <Input label="Contact email" type="email" value={form.contactEmail || ""} onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))} />
        <Input label="Contact phone" value={form.contactPhone || ""} onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))} />
        <Select label="Status" value={form.status || "active"} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "active" | "inactive" }))} options={[{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
        <Input label="Commission rate (%)" type="number" min="0" max="100" step="0.1" value={String(form.commissionRate ?? 0)} onChange={(event) => setForm((current) => ({ ...current, commissionRate: Number(event.target.value) || 0 }))} />
        <Input label="Price override (%)" type="number" min="-100" max="100" step="0.1" value={String(form.priceOverridePercent ?? 0)} onChange={(event) => setForm((current) => ({ ...current, priceOverridePercent: Number(event.target.value) || 0 }))} />
        <Input label="Payout balance" type="number" step="0.01" value={String(form.payoutBalance ?? 0)} onChange={(event) => setForm((current) => ({ ...current, payoutBalance: Number(event.target.value) || 0 }))} />
        <Input label="Total paid out" type="number" step="0.01" value={String(form.totalPaidOut ?? 0)} onChange={(event) => setForm((current) => ({ ...current, totalPaidOut: Number(event.target.value) || 0 }))} />
        <Input label="Last payout reference" value={form.lastPayoutReference || ""} onChange={(event) => setForm((current) => ({ ...current, lastPayoutReference: event.target.value }))} />
        <Input label="Last payout at" type="date" value={form.lastPayoutAt ? form.lastPayoutAt.slice(0, 10) : ""} onChange={(event) => setForm((current) => ({ ...current, lastPayoutAt: event.target.value || null }))} />
      </div>

      <Textarea label="Internal notes" value={form.notes || ""} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="space-y-3">
          <p className="font-medium text-text-primary">Subscribers</p>
          <Input placeholder="Search subscribers" value={userSearch} onChange={(event) => setUserSearch(event.target.value)} />
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {(usersQuery.data?.items || []).map((user) => (
              <button key={user.id} type="button" onClick={() => toggleSelection("assignedUserIds", user.id)} className={`w-full rounded-xl border px-3 py-2 text-left ${form.assignedUserIds?.includes(user.id) ? "border-primary/50 bg-primary/10" : "border-background-border"}`}>
                <p className="text-sm font-medium text-text-primary">{user.name}</p>
                <p className="text-xs text-text-secondary">{user.email} · {user.company || "Independent"}</p>
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {selectedUsers.map((user) => (
              <p key={user.id} className="text-xs text-text-secondary">{user.name} · {user.email}</p>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="font-medium text-text-primary">Routers</p>
          <Input placeholder="Search routers" value={routerSearch} onChange={(event) => setRouterSearch(event.target.value)} />
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {(routersQuery.data?.items || []).map((router) => (
              <button key={router.id} type="button" onClick={() => toggleSelection("assignedRouterIds", router.id)} className={`w-full rounded-xl border px-3 py-2 text-left ${form.assignedRouterIds?.includes(router.id) ? "border-primary/50 bg-primary/10" : "border-background-border"}`}>
                <p className="text-sm font-medium text-text-primary">{router.name}</p>
                <p className="text-xs text-text-secondary">{router.serverNode} · {router.status} · {router.vpnIp || "No VPN IP"}</p>
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {selectedRouters.map((router) => (
              <p key={router.id} className="text-xs text-text-secondary">{router.name} · {router.status}</p>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="font-medium text-text-primary">Service plans</p>
          <Input placeholder="Search plans" value={planSearch} onChange={(event) => setPlanSearch(event.target.value)} />
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {(plansQuery.data || []).slice(0, 8).map((plan) => (
              <button key={plan.id} type="button" onClick={() => toggleSelection("assignedPlanIds", plan.id)} className={`w-full rounded-xl border px-3 py-2 text-left ${form.assignedPlanIds?.includes(plan.id) ? "border-primary/50 bg-primary/10" : "border-background-border"}`}>
                <p className="text-sm font-medium text-text-primary">{plan.name}</p>
                <p className="text-xs text-text-secondary">{plan.planType} · {plan.price} {plan.currency}</p>
              </button>
            ))}
          </div>
          <div className="space-y-1">
            {selectedPlans.map((plan) => (
              <p key={plan.id} className="text-xs text-text-secondary">{plan.name} · {plan.price} {plan.currency}</p>
            ))}
          </div>
        </Card>
      </div>

      <Input label="Audit reason" value={form.reason || ""} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} />
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={createMutation.isPending || updateMutation.isPending} onClick={submit}>{reseller ? "Save changes" : "Create reseller"}</Button>
      </div>
    </Modal>
  );
}

export function ResellersPage() {
  const user = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ResellerRecord | null>(null);
  const resellersQuery = useResellers({ q: search || undefined, status: status || undefined });
  const activateMutation = useActivateReseller();
  const deactivateMutation = useDeactivateReseller();
  const deleteMutation = useDeleteReseller();

  if (!can(user || undefined, permissions.settingsManage)) {
    return <Navigate to={appRoutes.forbidden} replace />;
  }

  if (resellersQuery.isPending) {
    return (
      <SettingsShell title="Reseller Management" description="Manage reseller accounts, commercial ownership, router allocation, and payout controls.">
        <SectionLoader />
      </SettingsShell>
    );
  }

  if (resellersQuery.isError) {
    return (
      <SettingsShell title="Reseller Management" description="Manage reseller accounts, commercial ownership, router allocation, and payout controls.">
        <ErrorState title="Unable to load resellers" description="The reseller management API could not be reached." onAction={() => void resellersQuery.refetch()} />
      </SettingsShell>
    );
  }

  const resellers = resellersQuery.data || [];
  const active = resellers.filter((item) => item.status === "active").length;
  const assignedUsers = resellers.reduce((sum, item) => sum + item.summary.assignedUsers, 0);
  const assignedRouters = resellers.reduce((sum, item) => sum + item.summary.assignedRouters, 0);

  return (
    <SettingsShell
      title="Reseller Management"
      description="Manage reseller identity, assigned subscribers, allocated routers, plan catalogs, and payout tracking."
      actions={(
        <div className="flex gap-3">
          <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} isLoading={resellersQuery.isFetching} onClick={() => void resellersQuery.refetch()}>
            Refresh
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            Add reseller
          </Button>
        </div>
      )}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard title="Total resellers" value={String(resellers.length)} progress={100} />
        <MetricCard title="Active" value={String(active)} progress={resellers.length ? Math.round((active / resellers.length) * 100) : 0} />
        <MetricCard title="Assigned subscribers" value={String(assignedUsers)} progress={Math.min(100, assignedUsers * 5)} />
        <MetricCard title="Assigned routers" value={String(assignedRouters)} progress={Math.min(100, assignedRouters * 5)} />
      </div>

      <Card className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Input label="Search" placeholder="Search reseller, company, code, contact, or territory" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value)} options={[{ label: "All statuses", value: "" }, { label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
        <div className="rounded-2xl border border-background-border bg-background-elevated/60 p-4 text-sm text-text-secondary">
          Reseller allocation is now live. Use each record to attach subscribers, routers, and commercial plan access to a single channel partner.
        </div>
      </Card>

      {resellers.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {resellers.map((reseller) => (
            <Card key={reseller.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{reseller.name}</p>
                      <p className="text-sm text-text-secondary">{reseller.code} · {reseller.companyName || "Independent reseller"}</p>
                    </div>
                  </div>
                </div>
                <Badge tone={reseller.status === "active" ? "success" : "neutral"}>{reseller.status}</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3 text-sm text-text-primary">Territory: {reseller.territory || "Not set"}</div>
                <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3 text-sm text-text-primary">Commission: {reseller.commissionRate}%</div>
                <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3 text-sm text-text-primary">Subscribers: {reseller.summary.assignedUsers}</div>
                <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3 text-sm text-text-primary">Routers: {reseller.summary.assignedRouters}</div>
                <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3 text-sm text-text-primary">Plans: {reseller.summary.assignedPlans}</div>
                <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3 text-sm text-text-primary">Payout balance: {reseller.payoutBalance}</div>
              </div>

              <div className="space-y-1 text-sm text-text-secondary">
                <p>Contact: {reseller.contactName || "Not set"} · {reseller.contactEmail || "No email"}{reseller.contactPhone ? ` · ${reseller.contactPhone}` : ""}</p>
                <p>Price override: {reseller.priceOverridePercent}%</p>
                {reseller.notes ? <p>{reseller.notes}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={() => { setEditing(reseller); setDialogOpen(true); }}>
                  Edit
                </Button>
                {reseller.status === "active" ? (
                  <Button variant="ghost" size="sm" onClick={() => void deactivateMutation.mutateAsync([reseller.id, "Disabled from reseller workspace"] as never)}>
                    Deactivate
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => void activateMutation.mutateAsync([reseller.id, "Reactivated from reseller workspace"] as never)}>
                    Activate
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => void deleteMutation.mutateAsync([reseller.id, "Deleted from reseller workspace"] as never)}>
                  <span className="flex items-center gap-1 text-danger"><Trash2 className="h-4 w-4" /> Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="No resellers yet" description="Create the first reseller record to start assigning customers, routers, and commercial ownership." />
      )}

      <ResellerDialog open={dialogOpen} reseller={editing} onClose={() => setDialogOpen(false)} />
    </SettingsShell>
  );
}
