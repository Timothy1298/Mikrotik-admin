import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/app/store/auth.store";
import { Plus, Ticket, Trash2 } from "lucide-react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import {
  useCreateServicePlan,
  useDeactivateServicePlan,
  useDeleteServicePlan,
  useExportVouchers,
  useGenerateVouchers,
  useServicePlans,
  useUpdateServicePlan,
  useVouchers,
} from "@/features/service-plans/hooks/useServicePlans";
import type { CreatePlanPayload, ServicePlan } from "@/features/service-plans/types/service-plan.types";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";
import { appRoutes } from "@/config/routes";

function formatSpeed(kbps: number) {
  if (!kbps) return "Unlimited";
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(0)} Mbps`;
  return `${kbps} Kbps`;
}

function PlanDialog({ open, plan, onClose }: { open: boolean; plan: ServicePlan | null; onClose: () => void }) {
  const createMutation = useCreateServicePlan();
  const updateMutation = useUpdateServicePlan();
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState<CreatePlanPayload>({
    name: plan?.name || "",
    description: plan?.description || "",
    planType: plan?.planType || "monthly",
    price: plan?.price || 0,
    currency: plan?.currency || "USD",
    dataCapGB: plan?.dataCapGB || 0,
    speedDownloadKbps: plan?.speedDownloadKbps || 0,
    speedUploadKbps: plan?.speedUploadKbps || 0,
    fupEnabled: plan?.fupEnabled || false,
    fupThresholdGB: plan?.fupThresholdGB || 0,
    fupSpeedDownloadKbps: plan?.fupSpeedDownloadKbps || 512,
    fupSpeedUploadKbps: plan?.fupSpeedUploadKbps || 256,
    validityDays: plan?.validityDays || 30,
    peakSpeedEnabled: plan?.peakSpeedEnabled || false,
    peakHoursStart: plan?.peakHoursStart || 8,
    peakHoursEnd: plan?.peakHoursEnd || 22,
    peakSpeedDownloadKbps: plan?.peakSpeedDownloadKbps || 0,
    offPeakSpeedDownloadKbps: plan?.offPeakSpeedDownloadKbps || 0,
    isActive: plan?.isActive ?? true,
    assignedToAllRouters: plan?.assignedToAllRouters ?? true,
    routerIds: plan?.routerIds || [],
  });

  useEffect(() => {
    setForm({
      name: plan?.name || "",
      description: plan?.description || "",
      planType: plan?.planType || "monthly",
      price: plan?.price || 0,
      currency: plan?.currency || "USD",
      dataCapGB: plan?.dataCapGB || 0,
      speedDownloadKbps: plan?.speedDownloadKbps || 0,
      speedUploadKbps: plan?.speedUploadKbps || 0,
      fupEnabled: plan?.fupEnabled || false,
      fupThresholdGB: plan?.fupThresholdGB || 0,
      fupSpeedDownloadKbps: plan?.fupSpeedDownloadKbps || 512,
      fupSpeedUploadKbps: plan?.fupSpeedUploadKbps || 256,
      validityDays: plan?.validityDays || 30,
      peakSpeedEnabled: plan?.peakSpeedEnabled || false,
      peakHoursStart: plan?.peakHoursStart || 8,
      peakHoursEnd: plan?.peakHoursEnd || 22,
      peakSpeedDownloadKbps: plan?.peakSpeedDownloadKbps || 0,
      offPeakSpeedDownloadKbps: plan?.offPeakSpeedDownloadKbps || 0,
      isActive: plan?.isActive ?? true,
      assignedToAllRouters: plan?.assignedToAllRouters ?? true,
      routerIds: plan?.routerIds || [],
    });
    setTab("basic");
  }, [plan, open]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (plan) {
      await updateMutation.mutateAsync([plan.id, form] as never);
    } else {
      await createMutation.mutateAsync([form] as never);
    }
    onClose();
  };

  return (
    <Modal open={open} title={plan ? "Edit Service Plan" : "Add Service Plan"} description="Manage pricing, speeds, FUP policy, and time-based access rules." onClose={onClose}>
      <Tabs
        tabs={[
          { label: "Basic Info", value: "basic" },
          { label: "Speed & Data", value: "speed" },
          { label: "FUP", value: "fup" },
          { label: "Time Access", value: "time" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "basic" ? (
        <div className="space-y-4">
          <Input label="Plan Name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Textarea label="Description" value={form.description || ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Plan Type" value={form.planType} onChange={(event) => setForm((current) => ({ ...current, planType: event.target.value }))} options={[{ label: "Monthly", value: "monthly" }, { label: "Weekly", value: "weekly" }, { label: "Daily", value: "daily" }, { label: "Prepaid", value: "prepaid" }]} />
            <Input label="Validity Days" type="number" value={String(form.validityDays)} onChange={(event) => setForm((current) => ({ ...current, validityDays: Number(event.target.value) || 0 }))} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Price" type="number" value={String(form.price)} onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) || 0 }))} />
            <Select label="Currency" value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} options={[{ label: "USD", value: "USD" }, { label: "KES", value: "KES" }, { label: "UGX", value: "UGX" }, { label: "TZS", value: "TZS" }]} />
          </div>
        </div>
      ) : null}
      {tab === "speed" ? (
        <div className="space-y-4">
          <Input label="Download Speed (Kbps)" type="number" value={String(form.speedDownloadKbps)} onChange={(event) => setForm((current) => ({ ...current, speedDownloadKbps: Number(event.target.value) || 0 }))} />
          <Input label="Upload Speed (Kbps)" type="number" value={String(form.speedUploadKbps)} onChange={(event) => setForm((current) => ({ ...current, speedUploadKbps: Number(event.target.value) || 0 }))} />
          <Input label="Data Cap (GB)" type="number" value={String(form.dataCapGB)} onChange={(event) => setForm((current) => ({ ...current, dataCapGB: Number(event.target.value) || 0 }))} />
        </div>
      ) : null}
      {tab === "fup" ? (
        <div className="space-y-4">
          <Switch checked={form.fupEnabled} label="Enable FUP" onClick={() => setForm((current) => ({ ...current, fupEnabled: !current.fupEnabled }))} />
          {form.fupEnabled ? (
            <>
              <Input label="FUP Threshold GB" type="number" value={String(form.fupThresholdGB)} onChange={(event) => setForm((current) => ({ ...current, fupThresholdGB: Number(event.target.value) || 0 }))} />
              <Input label="FUP Download Speed Kbps" type="number" value={String(form.fupSpeedDownloadKbps)} onChange={(event) => setForm((current) => ({ ...current, fupSpeedDownloadKbps: Number(event.target.value) || 0 }))} />
              <Input label="FUP Upload Speed Kbps" type="number" value={String(form.fupSpeedUploadKbps)} onChange={(event) => setForm((current) => ({ ...current, fupSpeedUploadKbps: Number(event.target.value) || 0 }))} />
            </>
          ) : null}
        </div>
      ) : null}
      {tab === "time" ? (
        <div className="space-y-4">
          <Switch checked={form.peakSpeedEnabled} label="Enable peak/off-peak speeds" onClick={() => setForm((current) => ({ ...current, peakSpeedEnabled: !current.peakSpeedEnabled }))} />
          {form.peakSpeedEnabled ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Peak Hours Start" type="number" value={String(form.peakHoursStart)} onChange={(event) => setForm((current) => ({ ...current, peakHoursStart: Number(event.target.value) || 0 }))} />
                <Input label="Peak Hours End" type="number" value={String(form.peakHoursEnd)} onChange={(event) => setForm((current) => ({ ...current, peakHoursEnd: Number(event.target.value) || 0 }))} />
              </div>
              <Input label="Peak Download Speed Kbps" type="number" value={String(form.peakSpeedDownloadKbps || 0)} onChange={(event) => setForm((current) => ({ ...current, peakSpeedDownloadKbps: Number(event.target.value) || 0 }))} />
              <Input label="Off-Peak Download Speed Kbps" type="number" value={String(form.offPeakSpeedDownloadKbps || 0)} onChange={(event) => setForm((current) => ({ ...current, offPeakSpeedDownloadKbps: Number(event.target.value) || 0 }))} />
            </>
          ) : null}
        </div>
      ) : null}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button isLoading={createMutation.isPending || updateMutation.isPending} onClick={handleSave}>{plan ? "Save Plan" : "Create Plan"}</Button>
      </div>
    </Modal>
  );
}

export function ServicePlansPage() {
  const user = useAuthStore((state) => state.user);
  const plansQuery = useServicePlans();
  const deactivateMutation = useDeactivateServicePlan();
  const deleteMutation = useDeleteServicePlan();
  const generateMutation = useGenerateVouchers();
  const exportMutation = useExportVouchers();
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [voucherQuantity, setVoucherQuantity] = useState("10");
  const [voucherValidityDays, setVoucherValidityDays] = useState("");
  const [voucherStatus, setVoucherStatus] = useState("");
  const canViewPlans = can(user || undefined, permissions.servicePlansView);
  const selectedPlan = (plansQuery.data || []).find((item) => item.id === selectedPlanId) || null;
  const vouchersQuery = useVouchers(selectedPlanId, { status: voucherStatus || undefined });

  const planCards = useMemo(() => plansQuery.data || [], [plansQuery.data]);

  useEffect(() => {
    if (!planCards.length) {
      if (selectedPlanId) setSelectedPlanId("");
      return;
    }

    if (!selectedPlanId || !planCards.some((item) => item.id === selectedPlanId)) {
      setSelectedPlanId(planCards[0].id);
    }
  }, [planCards, selectedPlanId]);

  if (!canViewPlans) {
    return <Navigate to={appRoutes.forbidden} replace />;
  }

  if (plansQuery.isPending) return <SectionLoader />;
  if (plansQuery.isError) {
    return <ErrorState title="Unable to load service plans" description="The service plan endpoints could not be reached." onAction={() => void plansQuery.refetch()} />;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Service Plans" description="Manage ISP subscription plans, speed limits, data caps, FUP policies, and prepaid vouchers." />
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditingPlan(null); setDialogOpen(true); }}>Add Plan</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
        <div className="grid gap-4">
          {planCards.length ? planCards.map((plan) => (
            <Card key={plan.id} className={selectedPlanId === plan.id ? "border-brand-500/35" : undefined}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <button type="button" className="text-left" onClick={() => setSelectedPlanId(plan.id)}>
                      <h3 className="text-lg font-semibold text-slate-100">{plan.name}</h3>
                    </button>
                    <p className="mt-1 text-sm text-slate-400">{plan.description || "No description provided."}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="info">{plan.planType}</Badge>
                    <Badge tone={plan.isActive ? "success" : "danger"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
                    {plan.fupEnabled ? <Badge tone="warning">FUP enabled</Badge> : null}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Price</p><p className="mt-2 text-sm text-slate-100">{formatCurrency(plan.price, plan.currency)} / {plan.validityDays} days</p></div>
                  <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Speed</p><p className="mt-2 text-sm text-slate-100">↓ {formatSpeed(plan.speedDownloadKbps)} / ↑ {formatSpeed(plan.speedUploadKbps)}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Data Cap</p><p className="mt-2 text-sm text-slate-100">{plan.dataCapGB === 0 ? "Unlimited" : `${plan.dataCapGB} GB`}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Subscribers</p><p className="mt-2 text-sm text-slate-100">{plan.subscriberCount} subscribers</p></div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditingPlan(plan); setDialogOpen(true); }}>Edit</Button>
                  <Button variant="ghost" size="sm" leftIcon={<Ticket className="h-4 w-4" />} onClick={() => setSelectedPlanId(plan.id)}>Vouchers</Button>
                  {plan.isActive ? (
                    <Button variant="outline" size="sm" onClick={() => void deactivateMutation.mutateAsync([plan.id] as never)}>Deactivate</Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => void deleteMutation.mutateAsync([plan.id] as never)}>
                    <span className="inline-flex items-center gap-1 text-danger"><Trash2 className="h-4 w-4" />Archive</span>
                  </Button>
                </div>
              </div>
            </Card>
          )) : (
            <Card>
              <div className="space-y-3 p-8 text-center">
                <h3 className="text-lg font-semibold text-slate-100">No service plans yet</h3>
                <p className="mx-auto max-w-md text-sm text-slate-400">
                  The service plan endpoint is reachable, but there are no plans in the database yet. Create the first plan to start managing vouchers and package pricing.
                </p>
                <div className="flex justify-center">
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setEditingPlan(null); setDialogOpen(true); }}>
                    Create First Plan
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className="space-y-4">
          <CardHeader>
            <div>
              <CardTitle>{selectedPlan ? selectedPlan.name : "Voucher Panel"}</CardTitle>
              <CardDescription>{selectedPlan ? "Generate and export prepaid vouchers for the selected plan." : "Select a plan to manage vouchers."}</CardDescription>
            </div>
          </CardHeader>

          {!selectedPlan ? (
            <p className="text-sm text-slate-500">Choose a service plan from the left to manage voucher batches.</p>
          ) : (
            <>
              <div className="space-y-3 rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.66)] p-4">
                <Input label="Quantity" type="number" min="1" max="500" value={voucherQuantity} onChange={(event) => setVoucherQuantity(event.target.value)} />
                <Input label="Validity Days (optional)" type="number" min="1" value={voucherValidityDays} onChange={(event) => setVoucherValidityDays(event.target.value)} />
                <div className="flex gap-3">
                  <Button
                    isLoading={generateMutation.isPending}
                    onClick={() => void generateMutation.mutateAsync([selectedPlan.id, { quantity: Number(voucherQuantity) || 1, validityDays: voucherValidityDays ? Number(voucherValidityDays) : undefined }] as never).then(() => void vouchersQuery.refetch())}
                  >
                    Generate
                  </Button>
                  <Button variant="outline" isLoading={exportMutation.isPending} onClick={() => void exportMutation.mutate({ planId: selectedPlan.id })}>Export CSV</Button>
                </div>
              </div>

              <Select
                label="Voucher Status"
                value={voucherStatus}
                onChange={(event) => setVoucherStatus(event.target.value)}
                options={[
                  { label: "All statuses", value: "" },
                  { label: "Unused", value: "unused" },
                  { label: "Used", value: "used" },
                  { label: "Expired", value: "expired" },
                  { label: "Revoked", value: "revoked" },
                ]}
              />

              {vouchersQuery.isPending ? <SectionLoader /> : vouchersQuery.isError ? <ErrorState title="Unable to load vouchers" description="Retry after confirming voucher endpoints are available." onAction={() => void vouchersQuery.refetch()} /> : (
                <div className="overflow-hidden rounded-2xl border border-brand-500/15">
                  <table className="min-w-full divide-y divide-brand-500/10 text-sm">
                    <thead className="bg-[rgba(8,14,31,0.9)] text-left text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-500/10">
                      {(vouchersQuery.data?.items || []).map((voucher) => (
                        <tr key={voucher.id}>
                          <td className="px-4 py-3 font-mono text-slate-200">{voucher.code}</td>
                          <td className="px-4 py-3"><Badge tone={voucher.status === "unused" ? "success" : voucher.status === "revoked" ? "danger" : "warning"}>{voucher.status}</Badge></td>
                          <td className="px-4 py-3 font-mono text-slate-400">{formatDateTime(voucher.expiresAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <PlanDialog open={dialogOpen} plan={editingPlan} onClose={() => setDialogOpen(false)} />
    </section>
  );
}
