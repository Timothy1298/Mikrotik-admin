import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import type { RouterQueue } from "@/features/queues/types/queue.types";

type ProfileOption = {
  label: string;
  value: string;
  rateLimit?: string;
};

function fromKbps(value: number) {
  if (!value) {
    return { amount: 0, unit: "Mbps" as const };
  }
  if (value % 1000 === 0) {
    return { amount: value / 1000, unit: "Mbps" as const };
  }
  return { amount: value, unit: "kbps" as const };
}

function toKbps(value: number, unit: "kbps" | "Mbps") {
  return unit === "Mbps" ? Math.round(value * 1000) : Math.round(value);
}

export function SubscriberBandwidthDialog({
  open,
  title,
  description,
  subscriberLabel,
  currentProfileName,
  currentProfileRateLimit,
  profiles,
  overrideTarget,
  existingOverride,
  disableSwitchProfile = false,
  disableEditCurrentProfile = false,
  switchDisabledReason,
  profileDisabledReason,
  switchLoading = false,
  profileLoading = false,
  overrideLoading = false,
  onClose,
  onSwitchProfile,
  onUpdateCurrentProfile,
  onApplyOverride,
}: {
  open: boolean;
  title: string;
  description: string;
  subscriberLabel: string;
  currentProfileName: string;
  currentProfileRateLimit?: string;
  profiles: ProfileOption[];
  overrideTarget?: string | null;
  existingOverride?: RouterQueue | null;
  disableSwitchProfile?: boolean;
  disableEditCurrentProfile?: boolean;
  switchDisabledReason?: string;
  profileDisabledReason?: string;
  switchLoading?: boolean;
  profileLoading?: boolean;
  overrideLoading?: boolean;
  onClose: () => void;
  onSwitchProfile: (profileName: string) => void;
  onUpdateCurrentProfile: (rateLimit: string) => void;
  onApplyOverride: (payload: { target: string; maxDownloadKbps: number; maxUploadKbps: number }) => void;
}) {
  const initialSelectedProfile = useMemo(() => {
    const matching = profiles.find((profile) => profile.value === currentProfileName);
    return matching?.value || profiles[0]?.value || currentProfileName;
  }, [currentProfileName, profiles]);
  const initialOverride = useMemo(() => ({
    ...fromKbps(existingOverride?.maxDownloadKbps || 0),
    upload: fromKbps(existingOverride?.maxUploadKbps || 0),
  }), [existingOverride]);

  const [selectedProfile, setSelectedProfile] = useState(initialSelectedProfile);
  const [profileRateLimit, setProfileRateLimit] = useState(currentProfileRateLimit || "");
  const [downloadValue, setDownloadValue] = useState(initialOverride.amount);
  const [downloadUnit, setDownloadUnit] = useState<"kbps" | "Mbps">(initialOverride.unit);
  const [uploadValue, setUploadValue] = useState(initialOverride.upload.amount);
  const [uploadUnit, setUploadUnit] = useState<"kbps" | "Mbps">(initialOverride.upload.unit);

  useEffect(() => {
    if (!open) return;
    setSelectedProfile(initialSelectedProfile);
    setProfileRateLimit(currentProfileRateLimit || "");
    setDownloadValue(initialOverride.amount);
    setDownloadUnit(initialOverride.unit);
    setUploadValue(initialOverride.upload.amount);
    setUploadUnit(initialOverride.upload.unit);
  }, [currentProfileRateLimit, initialOverride.amount, initialOverride.unit, initialOverride.upload.amount, initialOverride.upload.unit, initialSelectedProfile, open]);

  const overrideHint = overrideTarget
    ? existingOverride
      ? `A static override queue already exists for ${overrideTarget}. Saving here will update it.`
      : `A static override queue will be created for ${overrideTarget}.`
    : "This subscriber does not currently expose a stable target IP, so a static override cannot be created yet.";

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-background-border bg-background-panel p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Subscriber</p>
          <p className="mt-2 text-sm font-medium text-text-primary">{subscriberLabel}</p>
          <p className="mt-1 text-xs text-text-muted">Current source profile: {currentProfileName || "default"}{currentProfileRateLimit ? ` • ${currentProfileRateLimit}` : " • Unlimited"}</p>
        </div>

        <div className="space-y-3 rounded-2xl border border-background-border bg-background-panel p-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Switch subscriber profile</p>
            <p className="text-xs text-text-muted">Use this when the subscriber should move to another pre-defined plan without changing the whole source profile.</p>
            {disableSwitchProfile && switchDisabledReason ? <p className="mt-1 text-xs text-warning">{switchDisabledReason}</p> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            {disableSwitchProfile ? (
              <div className="grid gap-2 text-sm text-text-primary">
                <span className="font-medium text-text-secondary">Available profile</span>
                <div className="flex min-h-11 items-center rounded-lg border border-background-border bg-background-panel px-4">
                  <Badge tone="info">{currentProfileName || "default"}</Badge>
                </div>
              </div>
            ) : (
              <Select
                label="Available profile"
                options={profiles}
                value={selectedProfile}
                onChange={(event) => setSelectedProfile(event.target.value)}
                disabled={disableSwitchProfile}
              />
            )}
            <Button onClick={() => onSwitchProfile(selectedProfile)} isLoading={switchLoading} disabled={disableSwitchProfile || !selectedProfile}>Switch profile</Button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-background-border bg-background-panel p-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Edit current source profile</p>
            <p className="text-xs text-text-muted">Use this when everyone on {currentProfileName || "this profile"} should inherit the new rate-limit.</p>
            {disableEditCurrentProfile && profileDisabledReason ? <p className="mt-1 text-xs text-warning">{profileDisabledReason}</p> : null}
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <Input
              label="Rate limit"
              value={profileRateLimit}
              onChange={(event) => setProfileRateLimit(event.target.value)}
              placeholder='Example: "10M/5M"'
              disabled={disableEditCurrentProfile}
            />
            <Button onClick={() => onUpdateCurrentProfile(profileRateLimit.trim())} isLoading={profileLoading} disabled={disableEditCurrentProfile}>Save profile</Button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-background-border bg-background-panel p-4">
          <div>
            <p className="text-sm font-medium text-text-primary">Dedicated override queue</p>
            <p className="text-xs text-text-muted">{overrideHint}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-3">
              <Input
                label="Download limit"
                type="number"
                min="0"
                value={String(downloadValue)}
                onChange={(event) => setDownloadValue(Number(event.target.value) || 0)}
                disabled={!overrideTarget}
              />
              <Select
                label="Unit"
                options={[{ label: "Mbps", value: "Mbps" }, { label: "kbps", value: "kbps" }]}
                value={downloadUnit}
                onChange={(event) => setDownloadUnit(event.target.value as "kbps" | "Mbps")}
                disabled={!overrideTarget}
              />
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_140px] gap-3">
              <Input
                label="Upload limit"
                type="number"
                min="0"
                value={String(uploadValue)}
                onChange={(event) => setUploadValue(Number(event.target.value) || 0)}
                disabled={!overrideTarget}
              />
              <Select
                label="Unit"
                options={[{ label: "Mbps", value: "Mbps" }, { label: "kbps", value: "kbps" }]}
                value={uploadUnit}
                onChange={(event) => setUploadUnit(event.target.value as "kbps" | "Mbps")}
                disabled={!overrideTarget}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-text-muted">{overrideTarget ? `Target ${overrideTarget}` : "No current target IP available"}</p>
            <Button
              onClick={() => {
                if (!overrideTarget) return;
                onApplyOverride({
                  target: overrideTarget,
                  maxDownloadKbps: toKbps(downloadValue, downloadUnit),
                  maxUploadKbps: toKbps(uploadValue, uploadUnit),
                });
              }}
              isLoading={overrideLoading}
              disabled={!overrideTarget}
            >
              {existingOverride ? "Update override" : "Create override"}
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
