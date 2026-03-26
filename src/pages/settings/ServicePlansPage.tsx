import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { BadgeCheck, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { appRoutes } from "@/config/routes";
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
import type { CreatePlanPayload, ServicePlan, Voucher } from "@/features/service-plans/types/service-plan.types";
import { useDisclosure } from "@/hooks/ui/useDisclosure";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatDateTime } from "@/lib/formatters/date";
import { cn } from "@/lib/utils/cn";
import { can } from "@/lib/permissions/can";
import { permissions } from "@/lib/permissions/permissions";
import { SettingsShell } from "@/pages/settings/components/SettingsShell";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, "0")}:00 (${i === 0 ? "Midnight" : i < 12 ? `${i} AM` : i === 12 ? "Noon" : `${i - 12} PM`})`,
}));

function formatSpeed(kbps: number) {
  if (!kbps) return "Unlimited";
  if (kbps >= 1000) return `${(kbps / 1000).toFixed(0)} Mbps`;
  return `${kbps} Kbps`;
}

function SpeedInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const hint = value === 0 ? "0 = Unlimited" : value >= 1000 ? `= ${(value / 1000).toFixed(1)} Mbps` : `= ${value} kbps`;

  return (
    <Input
      label={label}
      type="number"
      value={String(value)}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      hint={hint}
      placeholder="0 = unlimited"
    />
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  plan: ServicePlan;
  isSelected: boolean;
  onSelect: (planId: string) => void;
  onEdit: (plan: ServicePlan) => void;
  onDeactivate: (plan: ServicePlan) => void;
  onDelete: (plan: ServicePlan) => void;
}) {
  return (
    <div
      onClick={() => onSelect(plan.id)}
      className={cn(
        "surface-card cursor-pointer transition-all duration-200",
        isSelected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background-main border-primary/50"
          : "hover:border-primary/30 hover:bg-primary/5",
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("w-1 self-stretch rounded-full", plan.isActive ? "bg-success" : "bg-text-muted")} />

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary">{plan.name}</h3>
                {isSelected ? <Badge tone="info">Selected</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-text-secondary">{plan.description || "No description."}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Badge tone={plan.isActive ? "success" : "neutral"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
              <Badge tone="neutral">{plan.planType}</Badge>
              {plan.fupEnabled ? <Badge tone="warning">FUP</Badge> : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-primary/20 bg-primary/8 p-3">
              <p className="text-xs uppercase tracking-wider text-text-muted">Price</p>
              <p className="mt-1 text-lg font-bold text-text-primary">{formatCurrency(plan.price, plan.currency)}</p>
              <p className="text-xs text-text-secondary">per {plan.validityDays} days</p>
            </div>
            <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3">
              <p className="text-xs uppercase tracking-wider text-text-muted">Speed</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">Down {formatSpeed(plan.speedDownloadKbps)}</p>
              <p className="text-xs text-text-secondary">Up {formatSpeed(plan.speedUploadKbps)}</p>
            </div>
            <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3">
              <p className="text-xs uppercase tracking-wider text-text-muted">Data Cap</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{plan.dataCapGB === 0 ? "Unlimited" : `${plan.dataCapGB} GB`}</p>
            </div>
            <div className="rounded-xl border border-background-border bg-background-elevated/60 p-3">
              <p className="text-xs uppercase tracking-wider text-text-muted">Subscribers</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{plan.subscriberCount}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1" onClick={(event) => event.stopPropagation()}>
            <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
              Edit
            </Button>
            {plan.isActive ? (
              <Button variant="ghost" size="sm" onClick={() => onDeactivate(plan)}>
                Deactivate
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => onDelete(plan)}>
              <span className="flex items-center gap-1 text-danger">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoucherPanel({
  plan,
  voucherQuantity,
  setVoucherQuantity,
  voucherValidityDays,
  setVoucherValidityDays,
  voucherStatus,
  setVoucherStatus,
  vouchersQuery,
  generateMutation,
  exportMutation,
}: {
  plan: ServicePlan;
  voucherQuantity: string;
  setVoucherQuantity: (value: string) => void;
  voucherValidityDays: string;
  setVoucherValidityDays: (value: string) => void;
  voucherStatus: string;
  setVoucherStatus: (value: string) => void;
  vouchersQuery: ReturnType<typeof useVouchers>;
  generateMutation: ReturnType<typeof useGenerateVouchers>;
  exportMutation: ReturnType<typeof useExportVouchers>;
}) {
  const handleGenerate = () =>
    void generateMutation
      .mutateAsync([
        plan.id,
        {
          quantity: Number(voucherQuantity) || 1,
          validityDays: voucherValidityDays ? Number(voucherValidityDays) : undefined,
        },
      ] as never)
      .then(() => void vouchersQuery.refetch());

  const handleExport = () => void exportMutation.mutate({ planId: plan.id });

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Vouchers - {plan.name}</CardTitle>
          <CardDescription>Generate and manage prepaid access codes for this plan.</CardDescription>
        </div>
        <Badge tone={plan.isActive ? "success" : "neutral"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
      </CardHeader>

      <div className="space-y-4 rounded-xl border border-background-border bg-background-elevated/50 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Quantity (max 500)"
            type="number"
            min="1"
            max="500"
            value={voucherQuantity}
            onChange={(event) => setVoucherQuantity(event.target.value)}
          />
          <Input
            label="Custom validity days"
            type="number"
            min="1"
            placeholder={`Default: ${plan.validityDays} days`}
            value={voucherValidityDays}
            onChange={(event) => setVoucherValidityDays(event.target.value)}
          />
        </div>
        <p className="text-sm text-text-secondary">
          Generating <span className="font-medium text-text-primary">{voucherQuantity || 0} vouchers</span> for{" "}
          <span className="font-medium text-text-primary">{plan.name}</span> valid for{" "}
          <span className="font-medium text-text-primary">{voucherValidityDays || plan.validityDays} days</span>
        </p>
        <div className="flex gap-3">
          <Button isLoading={generateMutation.isPending} onClick={handleGenerate}>
            Generate
          </Button>
          <Button variant="outline" isLoading={exportMutation.isPending} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <Select
        label="Filter by status"
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

      {vouchersQuery.isPending ? (
        <SectionLoader />
      ) : vouchersQuery.isError ? (
        <ErrorState
          title="Unable to load vouchers"
          description="Retry after confirming voucher endpoints are available."
          onAction={() => void vouchersQuery.refetch()}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-background-border">
          <table className="min-w-full divide-y divide-brand-500/10 text-sm">
            <thead className="bg-background-panel text-left text-text-secondary">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Validity</th>
                <th className="px-4 py-3">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-500/10">
              {(vouchersQuery.data?.items || []).map((voucher: Voucher) => (
                <tr key={voucher.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-text-primary">{voucher.code}</span>
                      <CopyButton value={voucher.code} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={voucher.status === "unused" ? "success" : voucher.status === "revoked" ? "danger" : "warning"}>
                      {voucher.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{voucher.validityDays} days</td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{formatDateTime(voucher.expiresAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function PlanFormModal({
  open,
  plan,
  onClose,
}: {
  open: boolean;
  plan: ServicePlan | null;
  onClose: () => void;
}) {
  const createMutation = useCreateServicePlan();
  const updateMutation = useUpdateServicePlan();
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
    <Modal
      open={open}
      title={plan ? "Edit plan" : "New service plan"}
      description="Configure pricing, speeds, data policy, and time-based access."
      onClose={onClose}
      maxWidthClass="max-w-4xl"
    >
      <div className="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
        <FormSection title="Plan details" description="Name, pricing, and billing cycle.">
          <Input label="Plan name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <Textarea
            label="Description"
            value={form.description || ""}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Billing type"
              value={form.planType}
              onChange={(event) => setForm((current) => ({ ...current, planType: event.target.value }))}
              options={[
                { label: "Monthly", value: "monthly" },
                { label: "Weekly", value: "weekly" },
                { label: "Daily", value: "daily" },
                { label: "Prepaid", value: "prepaid" },
              ]}
            />
            <Input
              label="Validity days"
              type="number"
              value={String(form.validityDays)}
              onChange={(event) => setForm((current) => ({ ...current, validityDays: Number(event.target.value) || 0 }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Price"
              type="number"
              value={String(form.price)}
              onChange={(event) => setForm((current) => ({ ...current, price: Number(event.target.value) || 0 }))}
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
              options={[
                { label: "USD", value: "USD" },
                { label: "KES", value: "KES" },
                { label: "UGX", value: "UGX" },
                { label: "TZS", value: "TZS" },
              ]}
            />
          </div>
        </FormSection>

        <hr className="border-background-border" />

        <FormSection title="Speed & data limits" description="Bandwidth caps applied to the router queue.">
          <div className="grid gap-4 md:grid-cols-2">
            <SpeedInput
              label="Download speed"
              value={form.speedDownloadKbps}
              onChange={(value) => setForm((current) => ({ ...current, speedDownloadKbps: value }))}
            />
            <SpeedInput
              label="Upload speed"
              value={form.speedUploadKbps}
              onChange={(value) => setForm((current) => ({ ...current, speedUploadKbps: value }))}
            />
          </div>
          <Input
            label="Data cap (GB)"
            type="number"
            hint="Set to 0 for unlimited."
            value={String(form.dataCapGB)}
            onChange={(event) => setForm((current) => ({ ...current, dataCapGB: Number(event.target.value) || 0 }))}
          />
        </FormSection>

        <hr className="border-background-border" />

        <FormSection title="Fair Usage Policy" description="Throttle speeds after a data threshold is reached.">
          <Switch
            checked={form.fupEnabled}
            label="Enable FUP throttling"
            onClick={() => setForm((current) => ({ ...current, fupEnabled: !current.fupEnabled }))}
          />
          {form.fupEnabled ? (
            <div className="mt-4 space-y-4">
              <Input
                label="FUP threshold (GB)"
                type="number"
                value={String(form.fupThresholdGB)}
                onChange={(event) => setForm((current) => ({ ...current, fupThresholdGB: Number(event.target.value) || 0 }))}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <SpeedInput
                  label="FUP download speed"
                  value={form.fupSpeedDownloadKbps}
                  onChange={(value) => setForm((current) => ({ ...current, fupSpeedDownloadKbps: value }))}
                />
                <SpeedInput
                  label="FUP upload speed"
                  value={form.fupSpeedUploadKbps}
                  onChange={(value) => setForm((current) => ({ ...current, fupSpeedUploadKbps: value }))}
                />
              </div>
            </div>
          ) : null}
        </FormSection>

        <hr className="border-background-border" />

        <FormSection title="Peak / off-peak hours" description="Apply different speeds during busy hours.">
          <Switch
            checked={form.peakSpeedEnabled}
            label="Enable peak/off-peak speeds"
            onClick={() => setForm((current) => ({ ...current, peakSpeedEnabled: !current.peakSpeedEnabled }))}
          />
          {form.peakSpeedEnabled ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Peak hours start"
                  value={String(form.peakHoursStart)}
                  onChange={(event) => setForm((current) => ({ ...current, peakHoursStart: Number(event.target.value) || 0 }))}
                  options={HOUR_OPTIONS}
                />
                <Select
                  label="Peak hours end"
                  value={String(form.peakHoursEnd)}
                  onChange={(event) => setForm((current) => ({ ...current, peakHoursEnd: Number(event.target.value) || 0 }))}
                  options={HOUR_OPTIONS}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <SpeedInput
                  label="Peak download speed"
                  value={form.peakSpeedDownloadKbps || 0}
                  onChange={(value) => setForm((current) => ({ ...current, peakSpeedDownloadKbps: value }))}
                />
                <SpeedInput
                  label="Off-peak download speed"
                  value={form.offPeakSpeedDownloadKbps || 0}
                  onChange={(value) => setForm((current) => ({ ...current, offPeakSpeedDownloadKbps: value }))}
                />
              </div>
            </div>
          ) : null}
        </FormSection>
      </div>

      <div className="flex justify-end gap-3 border-t border-background-border pt-4">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button isLoading={createMutation.isPending || updateMutation.isPending} onClick={handleSave}>
          {plan ? "Save changes" : "Create plan"}
        </Button>
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
  const [planToDelete, setPlanToDelete] = useState<ServicePlan | null>(null);
  const [planToDeactivate, setPlanToDeactivate] = useState<ServicePlan | null>(null);
  const deleteDialog = useDisclosure(false);
  const deactivateDialog = useDisclosure(false);
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
    return (
      <ErrorState
        title="Unable to load service plans"
        description="The service plan endpoints could not be reached."
        onAction={() => void plansQuery.refetch()}
      />
    );
  }

  return (
    <SettingsShell
      title="Service Plans"
      description="Manage ISP subscription plans, speeds, data caps, FUP policies, and prepaid vouchers."
      actions={
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditingPlan(null);
            setDialogOpen(true);
          }}
        >
          New Plan
        </Button>
      }
    >

      <div className="grid gap-4">
        {planCards.length ? (
          planCards.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              onSelect={setSelectedPlanId}
              onEdit={(value) => {
                setEditingPlan(value);
                setDialogOpen(true);
              }}
              onDeactivate={(value) => {
                setPlanToDeactivate(value);
                deactivateDialog.onOpen();
              }}
              onDelete={(value) => {
                setPlanToDelete(value);
                deleteDialog.onOpen();
              }}
            />
          ))
        ) : (
          <EmptyState
            icon={BadgeCheck}
            title="No service plans"
            description="Create your first subscription plan to start managing speeds, prices, and prepaid vouchers."
          />
        )}
      </div>

      {selectedPlan ? (
        <VoucherPanel
          plan={selectedPlan}
          voucherQuantity={voucherQuantity}
          setVoucherQuantity={setVoucherQuantity}
          voucherValidityDays={voucherValidityDays}
          setVoucherValidityDays={setVoucherValidityDays}
          voucherStatus={voucherStatus}
          setVoucherStatus={setVoucherStatus}
          vouchersQuery={vouchersQuery}
          generateMutation={generateMutation}
          exportMutation={exportMutation}
        />
      ) : null}

      <PlanFormModal open={dialogOpen} plan={editingPlan} onClose={() => setDialogOpen(false)} />

      <ConfirmDialog
        open={deactivateDialog.open}
        title="Deactivate service plan"
        description={`Deactivate ${planToDeactivate?.name || "this plan"}? Operators will no longer assign it to new subscribers.`}
        confirmLabel="Deactivate plan"
        onClose={() => {
          deactivateDialog.onClose();
          setPlanToDeactivate(null);
        }}
        onConfirm={() => {
          if (!planToDeactivate) return;
          void deactivateMutation.mutateAsync([planToDeactivate.id] as never).then(() => {
            deactivateDialog.onClose();
            setPlanToDeactivate(null);
          });
        }}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete service plan"
        description={`Archive ${planToDelete?.name || "this plan"}? This action should only be used when the plan is no longer needed.`}
        confirmLabel="Delete plan"
        onClose={() => {
          deleteDialog.onClose();
          setPlanToDelete(null);
        }}
        onConfirm={() => {
          if (!planToDelete) return;
          void deleteMutation.mutateAsync([planToDelete.id] as never).then(() => {
            deleteDialog.onClose();
            setPlanToDelete(null);
          });
        }}
      />
    </SettingsShell>
  );
}
