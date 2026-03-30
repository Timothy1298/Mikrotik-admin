import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { appRoutes } from "@/config/routes";
import { env } from "@/config/env";
import {
  useAdminProfile,
  useDisableTwoFactor,
  useEnableTwoFactor,
  usePlatformConfig,
  useSettings,
  useStartTwoFactorSetup,
  useUpdateAdminProfile,
} from "@/features/settings/hooks";
import { useForceLogoutUser } from "@/features/users/hooks";
import { generateQrSvgDataUrl } from "@/lib/utils/qrcode";
import { cn } from "@/lib/utils/cn";
import { SettingsShell } from "@/pages/settings/components/SettingsShell";
import { toast } from "sonner";

type SettingsSidebarUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  adminRole?: string | null;
} | null | undefined;

function SummaryItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-background-border bg-background-elevated/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  const score = Math.min(
    4,
    Number(password.length >= 8) +
      Number(password.length >= 12) +
      Number(/[A-Z]/.test(password)) +
      Number(/\d/.test(password)) +
      Number(/[^A-Za-z0-9]/.test(password)),
  );
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  const toneClass = score <= 1 ? "bg-danger" : score <= 3 ? "bg-amber-400" : "bg-success";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 flex-1 rounded-full bg-background-border transition-colors",
              index < score && toneClass,
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-muted">{label ? `Strength: ${label}` : "Strength: Add a longer password with mixed character types."}</p>
    </div>
  );
}

function FormHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
    </div>
  );
}

function ProfileTab({
  user,
  displayName,
  setDisplayName,
  profileError,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  handleProfileSubmit,
  handlePasswordSubmit,
  updateProfileMutationPending,
}: {
  user: SettingsSidebarUser;
  displayName: string;
  setDisplayName: (value: string) => void;
  profileError: string | null;
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  passwordError: string | null;
  handleProfileSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handlePasswordSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateProfileMutationPending: boolean;
}) {
  const initials = useMemo(() => {
    const value = (user?.name || "Admin").trim();
    return value
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [user?.name]);

  return (
    <div className="space-y-6">
      <FormHeading title="Profile Information" description="Update the display name shown in the admin console." />

      <Card className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text-primary">{user?.name || "Unknown operator"}</p>
          <p className="truncate text-sm text-text-secondary">{user?.email || "No email available"}</p>
          <div className="mt-2">
            <Badge tone="info">{formatAdminRole(user?.adminRole)}</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          <Input label="Email address" value={user?.email || ""} disabled hint="Email cannot be changed here." />
          {profileError ? <InlineError message={profileError} /> : null}
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateProfileMutationPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <FormHeading title="Change Password" description="Update your password. You'll need your current password to confirm." />

      <Card>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <PasswordInput label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          <PasswordInput
            label="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            hint="Use 8+ characters with uppercase, numbers, and symbols."
          />
          <PasswordStrengthBar password={newPassword} />
          <PasswordInput label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          {passwordError ? <InlineError message={passwordError} /> : null}
          <div className="flex justify-end">
            <Button type="submit" isLoading={updateProfileMutationPending}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function SecurityTab({
  isAdminAccount,
  currentTwoFactorEnabled,
  twoFactorPassword,
  setTwoFactorPassword,
  twoFactorSetupError,
  handleStartTwoFactorSetup,
  startTwoFactorSetupPending,
  twoFactorSetup,
  twoFactorQrCode,
  copyText,
  twoFactorSetupCode,
  setTwoFactorSetupCode,
  setTwoFactorSetup,
  setTwoFactorSetupError,
  handleEnableTwoFactor,
  enableTwoFactorPending,
  sessionStatus,
  permissionMode,
  twoFactorDisablePassword,
  setTwoFactorDisablePassword,
  twoFactorDisableCode,
  setTwoFactorDisableCode,
  twoFactorDisableError,
  handleDisableTwoFactor,
  disableTwoFactorPending,
  confirmSignOut,
  setConfirmSignOut,
  forceLogoutMutationPending,
  handleRevokeCurrentSessions,
}: {
  isAdminAccount: boolean;
  currentTwoFactorEnabled: boolean;
  twoFactorPassword: string;
  setTwoFactorPassword: (value: string) => void;
  twoFactorSetupError: string | null;
  handleStartTwoFactorSetup: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  startTwoFactorSetupPending: boolean;
  twoFactorSetup: { secret: string; otpauthUrl: string; manualEntryKey: string; issuer: string } | null;
  twoFactorQrCode: string | null;
  copyText: (value: string, label: string) => Promise<void>;
  twoFactorSetupCode: string;
  setTwoFactorSetupCode: (value: string) => void;
  setTwoFactorSetup: (value: { secret: string; otpauthUrl: string; manualEntryKey: string; issuer: string } | null) => void;
  setTwoFactorSetupError: (value: string | null) => void;
  handleEnableTwoFactor: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  enableTwoFactorPending: boolean;
  sessionStatus: string;
  permissionMode: string;
  twoFactorDisablePassword: string;
  setTwoFactorDisablePassword: (value: string) => void;
  twoFactorDisableCode: string;
  setTwoFactorDisableCode: (value: string) => void;
  twoFactorDisableError: string | null;
  handleDisableTwoFactor: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  disableTwoFactorPending: boolean;
  confirmSignOut: boolean;
  setConfirmSignOut: (value: boolean) => void;
  forceLogoutMutationPending: boolean;
  handleRevokeCurrentSessions: () => void;
}) {
  return (
    <div className="space-y-6">
      <FormHeading title="Two-Factor Authentication" description="Protect your account with an authenticator app." />

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {currentTwoFactorEnabled ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 text-text-muted" />
            )}
            <div>
              <p className="font-medium text-text-primary">
                {currentTwoFactorEnabled ? "Two-factor authentication is active" : "Two-factor authentication is off"}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {currentTwoFactorEnabled
                  ? "You'll be asked for a code from your authenticator app when signing in."
                  : "Add an extra layer of security to your account."}
              </p>
            </div>
          </div>
          <Badge tone={currentTwoFactorEnabled ? "success" : "neutral"}>{currentTwoFactorEnabled ? "Enabled" : "Disabled"}</Badge>
        </div>

        {!isAdminAccount ? (
          <div className="mt-5 rounded-2xl border border-background-border bg-background-elevated/70 p-4 text-sm leading-6 text-text-secondary">
            Authenticator-based two-factor authentication is limited to admin console accounts.
          </div>
        ) : null}

        {isAdminAccount && !currentTwoFactorEnabled && !twoFactorSetup ? (
          <form onSubmit={handleStartTwoFactorSetup} className="mt-5 space-y-4 border-t border-background-border pt-5">
            <PasswordInput
              label="Confirm your password to continue"
              value={twoFactorPassword}
              onChange={(event) => setTwoFactorPassword(event.target.value)}
            />
            {twoFactorSetupError ? <InlineError message={twoFactorSetupError} /> : null}
            <Button type="submit" variant="outline" isLoading={startTwoFactorSetupPending}>
              Set up authenticator
            </Button>
          </form>
        ) : null}

        {isAdminAccount && twoFactorSetup ? (
          <div className="mt-5 space-y-6 border-t border-background-border pt-5">
            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">1</div>
              <div className="flex-1 space-y-3">
                <p className="font-medium text-text-primary">Scan this QR code with your authenticator app</p>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="w-full max-w-[220px] rounded-3xl border border-background-border bg-background-elevated/70 p-4">
                    {twoFactorQrCode ? (
                      <img
                        src={twoFactorQrCode}
                        alt="Authenticator QR code"
                        className="mx-auto h-auto w-full rounded-2xl border border-background-border bg-[#0b1220] p-3"
                      />
                    ) : (
                      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-background-border bg-background-panel p-4 text-center text-sm text-text-secondary">
                        QR generation is unavailable. Use the manual key below.
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-4">
                    <SummaryItem label="Issuer" value={twoFactorSetup.issuer} />
                    <SummaryItem label="Manual entry key" value={twoFactorSetup.manualEntryKey} />
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => void copyText(twoFactorSetup.manualEntryKey, "Manual entry key")}>
                        Copy secret key
                      </Button>
                      <Button type="button" variant="outline" onClick={() => void copyText(twoFactorSetup.otpauthUrl, "Authenticator URI")}>
                        Copy authenticator URI
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">2</div>
              <div className="flex-1 space-y-3">
                <p className="font-medium text-text-primary">Enter the 6-digit code to confirm setup</p>
                <form onSubmit={handleEnableTwoFactor} className="space-y-4">
                  <Input
                    label="Authenticator code"
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorSetupCode}
                    onChange={(event) => setTwoFactorSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  {twoFactorSetupError ? <InlineError message={twoFactorSetupError} /> : null}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setTwoFactorSetup(null);
                        setTwoFactorSetupError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" isLoading={enableTwoFactorPending}>
                      Verify and enable 2FA
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <FormHeading title="Session & Access" description="Manage active sessions and account access." />

      <Card className="border-danger/20">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryItem label="Session status" value={sessionStatus} />
            <SummaryItem label="Permission scope" value={permissionMode} />
          </div>

          {currentTwoFactorEnabled ? (
            <div className="space-y-3 rounded-xl border border-danger/20 bg-danger/5 p-4">
              <p className="text-sm font-medium text-danger">Disable two-factor authentication</p>
              <form onSubmit={handleDisableTwoFactor} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <PasswordInput
                    label="Current password"
                    value={twoFactorDisablePassword}
                    onChange={(event) => setTwoFactorDisablePassword(event.target.value)}
                  />
                  <Input
                    label="Authenticator code"
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    value={twoFactorDisableCode}
                    onChange={(event) => setTwoFactorDisableCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                {twoFactorDisableError ? <InlineError message={twoFactorDisableError} /> : null}
                <Button type="submit" variant="danger" size="sm" isLoading={disableTwoFactorPending}>
                  Disable 2FA
                </Button>
              </form>
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-background-border p-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-text-primary">Sign out all sessions</p>
              <p className="text-xs text-text-muted">Revoke all active admin sessions for your account.</p>
            </div>
            {!confirmSignOut ? (
              <Button variant="outline" size="sm" onClick={() => setConfirmSignOut(true)}>
                Sign out all
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-text-secondary">Are you sure?</p>
                <Button size="sm" variant="danger" isLoading={forceLogoutMutationPending} onClick={handleRevokeCurrentSessions}>
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmSignOut(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function SystemInfoCard({
  title,
  description,
  onRefresh,
  isRefreshing,
  children,
}: {
  title: string;
  description: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onRefresh} leftIcon={<RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />}>
          Refresh
        </Button>
      </CardHeader>
      {children}
    </Card>
  );
}

function SystemTab({
  settingsQuery,
  platformQuery,
}: {
  settingsQuery: ReturnType<typeof useSettings>;
  platformQuery: ReturnType<typeof usePlatformConfig>;
}) {
  if (settingsQuery.isPending || platformQuery.isPending) {
    return <SectionLoader />;
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <ErrorState
        title="Unable to load runtime configuration"
        description="The frontend runtime settings could not be loaded."
        onAction={() => void settingsQuery.refetch()}
      />
    );
  }

  if (platformQuery.isError || !platformQuery.data) {
    return (
      <ErrorState
        title="Unable to load platform defaults"
        description="The platform configuration endpoint is not available."
        onAction={() => void platformQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <FormHeading title="System Configuration" description="Review the runtime values that shape the admin platform." />

      <div className="grid gap-5 xl:grid-cols-2">
        <SystemInfoCard
          title="Runtime Config"
          description="Frontend shell values loaded from the current environment."
          onRefresh={() => void settingsQuery.refetch()}
          isRefreshing={settingsQuery.isFetching}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryItem label="API URL" value={settingsQuery.data.apiBaseUrl} />
            <SummaryItem label="Environment" value={settingsQuery.data.appEnv} />
            <SummaryItem label="Request timeout" value={`${settingsQuery.data.requestTimeout} ms`} />
            <SummaryItem label="Mock mode" value={settingsQuery.data.mockModeEnabled ? "Enabled" : "Disabled"} />
          </div>
        </SystemInfoCard>

        <SystemInfoCard
          title="Platform Defaults"
          description="Server-provided defaults used for subscriptions and infrastructure provisioning."
          onRefresh={() => void platformQuery.refetch()}
          isRefreshing={platformQuery.isFetching}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryItem label="Router monthly price" value={String(platformQuery.data.routerMonthlyPrice)} />
            <SummaryItem label="Trial period" value={`${platformQuery.data.trialDays} days`} />
            <SummaryItem label="Server region" value={platformQuery.data.serverRegion} />
            <SummaryItem label="App version" value={platformQuery.data.appVersion} />
          </div>
        </SystemInfoCard>
      </div>

      <div className="rounded-2xl border border-background-border bg-background-elevated/70 p-4 text-sm text-text-secondary">
        These values are configured via environment variables and platform defaults. Refresh each card independently to check the current frontend runtime versus the latest server-provided configuration.
      </div>
    </div>
  );
}

function formatAdminRole(role?: string | null) {
  if (!role) return "Legacy Admin";
  return role.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function SettingsPage() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const settingsQuery = useSettings();
  const adminProfileQuery = useAdminProfile();
  const platformQuery = usePlatformConfig();
  const updateProfileMutation = useUpdateAdminProfile();
  const forceLogoutMutation = useForceLogoutUser();
  const startTwoFactorSetupMutation = useStartTwoFactorSetup();
  const enableTwoFactorMutation = useEnableTwoFactor();
  const disableTwoFactorMutation = useDisableTwoFactor();

  const [displayName, setDisplayName] = useState(user?.name || "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = useState("");
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState("");
  const [twoFactorSetupCode, setTwoFactorSetupCode] = useState("");
  const [twoFactorSetupError, setTwoFactorSetupError] = useState<string | null>(null);
  const [twoFactorDisableError, setTwoFactorDisableError] = useState<string | null>(null);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; otpauthUrl: string; manualEntryKey: string; issuer: string } | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  useEffect(() => {
    setDisplayName(user?.name || "");
  }, [user?.name]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    if (!displayName.trim()) {
      setProfileError("Display name is required.");
      return;
    }
    try {
      await updateProfileMutation.mutateAsync({ name: displayName.trim() });
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password");
    }
  };

  const handleRevokeCurrentSessions = () => {
    if (!user?.id) return;
    forceLogoutMutation.mutate([user.id] as never);
    setConfirmSignOut(false);
  };

  const currentTwoFactorEnabled = adminProfileQuery.data?.twoFactorEnabled ?? user?.twoFactorEnabled ?? false;
  const isAdminAccount = Boolean(user?.adminRole || user?.role);
  const twoFactorQrCode = useMemo(() => {
    if (!twoFactorSetup?.otpauthUrl) return null;
    try {
      return generateQrSvgDataUrl(twoFactorSetup.otpauthUrl, {
        cellSize: 4,
        margin: 4,
        darkColor: "#f8fafc",
        lightColor: "#0b1220",
      });
    } catch {
      return null;
    }
  }, [twoFactorSetup]);

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const handleStartTwoFactorSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFactorSetupError(null);
    try {
      const setup = await startTwoFactorSetupMutation.mutateAsync({ currentPassword: twoFactorPassword });
      setTwoFactorSetup(setup);
      setTwoFactorSetupCode("");
      setTwoFactorPassword("");
    } catch (error) {
      setTwoFactorSetupError(error instanceof Error ? error.message : "Failed to start 2FA setup");
    }
  };

  const handleEnableTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFactorSetupError(null);
    if (twoFactorSetupCode.trim().length !== 6) {
      setTwoFactorSetupError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    try {
      await enableTwoFactorMutation.mutateAsync({ code: twoFactorSetupCode.trim() });
      setTwoFactorSetup(null);
      setTwoFactorSetupCode("");
    } catch (error) {
      setTwoFactorSetupError(error instanceof Error ? error.message : "Failed to enable 2FA");
    }
  };

  const handleDisableTwoFactor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFactorDisableError(null);
    if (!twoFactorDisablePassword || twoFactorDisableCode.trim().length !== 6) {
      setTwoFactorDisableError("Current password and a valid 6-digit code are required.");
      return;
    }
    try {
      await disableTwoFactorMutation.mutateAsync({
        currentPassword: twoFactorDisablePassword,
        code: twoFactorDisableCode.trim(),
      });
      setTwoFactorDisablePassword("");
      setTwoFactorDisableCode("");
    } catch (error) {
      setTwoFactorDisableError(error instanceof Error ? error.message : "Failed to disable 2FA");
    }
  };

  const sessionStatus = sessionExpiresAt ? `Active until ${new Date(sessionExpiresAt).toLocaleString()}` : "Active session";
  const permissionMode = user?.adminRole ? formatAdminRole(user.adminRole) : "Legacy full admin";
  const refreshAction = (
    <Button
      variant="outline"
      onClick={() => {
        if (location.pathname === appRoutes.settingsSystem) {
          void Promise.all([settingsQuery.refetch(), platformQuery.refetch()]);
          return;
        }
        if (location.pathname === appRoutes.settingsSecurity) {
          void adminProfileQuery.refetch();
          return;
        }
        void adminProfileQuery.refetch();
      }}
      leftIcon={<RefreshCw className="h-4 w-4" />}
      isLoading={settingsQuery.isFetching || platformQuery.isFetching || adminProfileQuery.isFetching}
    >
      Refresh
    </Button>
  );

  return (
    <SettingsShell
        title="Settings"
        description="Manage operator profile details, account security, and platform defaults."
        meta={env.appEnv}
        actions={refreshAction}
    >
          {location.pathname === appRoutes.settings ? (
            <ProfileTab
              user={user}
              displayName={displayName}
              setDisplayName={setDisplayName}
              profileError={profileError}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              passwordError={passwordError}
              handleProfileSubmit={handleProfileSubmit}
              handlePasswordSubmit={handlePasswordSubmit}
              updateProfileMutationPending={updateProfileMutation.isPending}
            />
          ) : null}

          {location.pathname === appRoutes.settingsSecurity ? (
            <SecurityTab
              isAdminAccount={isAdminAccount}
              currentTwoFactorEnabled={currentTwoFactorEnabled}
              twoFactorPassword={twoFactorPassword}
              setTwoFactorPassword={setTwoFactorPassword}
              twoFactorSetupError={twoFactorSetupError}
              handleStartTwoFactorSetup={handleStartTwoFactorSetup}
              startTwoFactorSetupPending={startTwoFactorSetupMutation.isPending}
              twoFactorSetup={twoFactorSetup}
              twoFactorQrCode={twoFactorQrCode}
              copyText={copyText}
              twoFactorSetupCode={twoFactorSetupCode}
              setTwoFactorSetupCode={setTwoFactorSetupCode}
              setTwoFactorSetup={setTwoFactorSetup}
              setTwoFactorSetupError={setTwoFactorSetupError}
              handleEnableTwoFactor={handleEnableTwoFactor}
              enableTwoFactorPending={enableTwoFactorMutation.isPending}
              sessionStatus={sessionStatus}
              permissionMode={permissionMode}
              twoFactorDisablePassword={twoFactorDisablePassword}
              setTwoFactorDisablePassword={setTwoFactorDisablePassword}
              twoFactorDisableCode={twoFactorDisableCode}
              setTwoFactorDisableCode={setTwoFactorDisableCode}
              twoFactorDisableError={twoFactorDisableError}
              handleDisableTwoFactor={handleDisableTwoFactor}
              disableTwoFactorPending={disableTwoFactorMutation.isPending}
              confirmSignOut={confirmSignOut}
              setConfirmSignOut={setConfirmSignOut}
              forceLogoutMutationPending={forceLogoutMutation.isPending}
              handleRevokeCurrentSessions={handleRevokeCurrentSessions}
            />
          ) : null}

          {location.pathname === appRoutes.settingsSystem ? (
            <SystemTab settingsQuery={settingsQuery} platformQuery={platformQuery} />
          ) : null}
    </SettingsShell>
  );
}
