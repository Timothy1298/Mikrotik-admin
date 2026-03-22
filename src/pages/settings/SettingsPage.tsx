import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BadgeCheck, LockKeyhole, Settings2, Shield, UserCircle2 } from "lucide-react";
import { useAuthStore } from "@/app/store/auth.store";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineError } from "@/components/feedback/InlineError";
import { SectionLoader } from "@/components/feedback/SectionLoader";
import { PageHeader } from "@/components/layout/PageHeader";
import { RefreshButton } from "@/components/shared/RefreshButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Tabs } from "@/components/ui/Tabs";
import { appRoutes } from "@/config/routes";
import { settingsTabs } from "@/config/module-tabs";
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
import { permissions } from "@/lib/permissions/permissions";
import { can } from "@/lib/permissions/can";
import { toast } from "sonner";
import { generateQrSvgDataUrl } from "@/lib/utils/qrcode";

const settingsViews = {
  [appRoutes.settings]: {
    title: "Profile",
    description: "Update your operator profile and password.",
    icon: UserCircle2,
  },
  [appRoutes.settingsSecurity]: {
    title: "Security",
    description: "Review current session posture and future MFA coverage.",
    icon: LockKeyhole,
  },
  [appRoutes.settingsSystem]: {
    title: "System",
    description: "Inspect runtime defaults and server-provided platform configuration.",
    icon: Settings2,
  },
  [appRoutes.settingsAdmins]: {
    title: "Admin Accounts",
    description: "Create and manage admin users, roles, and access scope.",
    icon: Shield,
  },
  [appRoutes.settingsServicePlans]: {
    title: "Service Plans",
    description: "Manage subscriber plans, speeds, limits, and prepaid vouchers.",
    icon: BadgeCheck,
  },
  [appRoutes.settingsResellers]: {
    title: "Resellers",
    description: "Foundation entry point for future reseller and franchise tooling.",
    icon: Shield,
  },
} as const;

function SummaryItem({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

function formatAdminRole(role?: string | null) {
  if (!role) return "Legacy Admin";
  return role.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const view = settingsViews[location.pathname as keyof typeof settingsViews] ?? settingsViews[appRoutes.settings];
  const ViewIcon = view.icon;

  const settingsLinks = useMemo(() => {
    const links: Array<{ label: string; path: string }> = [
      { label: "Profile", path: appRoutes.settings },
      { label: "Security", path: appRoutes.settingsSecurity },
      { label: "System", path: appRoutes.settingsSystem },
    ];

    if (can(user || undefined, permissions.settingsManage)) {
      links.push({ label: "Admin Accounts", path: appRoutes.settingsAdmins });
    }
    if (can(user || undefined, permissions.servicePlansView)) {
      links.push({ label: "Service Plans", path: appRoutes.settingsServicePlans });
    }
    if (can(user || undefined, permissions.settingsManage)) {
      links.push({ label: "Resellers", path: appRoutes.settingsResellers });
    }
    return links;
  }, [user]);

  const visibleTabs = useMemo(() => {
    return settingsTabs.filter((tab) => {
      if (tab.value === appRoutes.settingsAdmins || tab.value === appRoutes.settingsResellers) {
        return can(user || undefined, permissions.settingsManage);
      }
      if (tab.value === appRoutes.settingsServicePlans) {
        return can(user || undefined, permissions.servicePlansView);
      }
      return true;
    });
  }, [user]);

  if (
    location.pathname === appRoutes.settingsAdmins ||
    location.pathname === appRoutes.settingsServicePlans ||
    location.pathname === appRoutes.settingsResellers
  ) {
    return <Navigate to={appRoutes.settings} replace />;
  }

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

  const renderMainContent = () => {
    if (location.pathname === appRoutes.settings) {
      return (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update the name shown throughout the admin console.</CardDescription>
              </div>
            </CardHeader>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <Input label="Display Name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              <Input label="Email Address" value={user?.email || ""} disabled hint="Email cannot be changed from this panel." />
              <Input label="Admin Role" value={formatAdminRole(user?.adminRole)} disabled />
              {profileError ? <InlineError message={profileError} /> : null}
              <div className="flex justify-end">
                <Button type="submit" isLoading={updateProfileMutation.isPending}>Save Changes</Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your current credentials without editing your profile information.</CardDescription>
              </div>
            </CardHeader>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <PasswordInput label="Current Password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
              <PasswordInput label="New Password" hint="Minimum 6 characters." value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
              <PasswordInput label="Confirm New Password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {passwordError ? <InlineError message={passwordError} /> : null}
              <div className="flex justify-end">
                <Button type="submit" isLoading={updateProfileMutation.isPending}>Update Password</Button>
              </div>
            </form>
          </Card>
        </div>
      );
    }

    if (location.pathname === appRoutes.settingsSecurity) {
      return (
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Protect administrator login with a 6-digit code from your authenticator app.</CardDescription>
              </div>
              <Badge tone={currentTwoFactorEnabled ? "success" : "warning"}>
                {currentTwoFactorEnabled ? "Configured" : "Not configured"}
              </Badge>
            </CardHeader>
            {!isAdminAccount ? (
              <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-sm leading-6 text-text-secondary">
                Authenticator-based two-factor authentication is restricted to admin console accounts. Non-admin users can continue using the standard account login flow.
              </div>
            ) : currentTwoFactorEnabled ? (
              <form className="space-y-4" onSubmit={handleDisableTwoFactor}>
                <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-sm leading-6 text-text-secondary">
                  Two-factor authentication is active. You will be prompted for an authenticator code after entering your password.
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <PasswordInput label="Current Password" value={twoFactorDisablePassword} onChange={(event) => setTwoFactorDisablePassword(event.target.value)} />
                  <Input
                    label="Authenticator Code"
                    value={twoFactorDisableCode}
                    onChange={(event) => setTwoFactorDisableCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                  />
                </div>
                {twoFactorDisableError ? <InlineError message={twoFactorDisableError} /> : null}
                <div className="flex justify-end">
                  <Button type="submit" variant="outline" isLoading={disableTwoFactorMutation.isPending}>
                    Disable 2FA
                  </Button>
                </div>
              </form>
            ) : twoFactorSetup ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-sm leading-6 text-text-secondary">
                  Scan the QR code below with your authenticator app. If scanning fails, use the manual entry key as the fallback.
                </div>
                <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                  <div className="rounded-3xl border border-background-border bg-background-panel p-4">
                    {twoFactorQrCode ? (
                      <img
                        src={twoFactorQrCode}
                        alt="Authenticator app QR code"
                        className="mx-auto h-auto w-full rounded-2xl border border-background-border bg-[#0b1220] p-3"
                      />
                    ) : (
                      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-center text-sm text-text-secondary">
                        QR generation is unavailable. Use the manual setup key instead.
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <SummaryItem label="Issuer" value={twoFactorSetup.issuer} />
                      <SummaryItem label="Manual entry key" value={twoFactorSetup.manualEntryKey} />
                    </div>
                    <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-sm leading-6 text-text-secondary">
                      <p>Recommended: open Google Authenticator, Microsoft Authenticator, Authy, or 1Password and scan this QR code.</p>
                      <p className="mt-2">Fallback: choose manual setup in the app and paste the secret key if scanning does not work.</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Button type="button" variant="outline" onClick={() => void copyText(twoFactorSetup.manualEntryKey, "Manual entry key")}>
                        Copy secret key
                      </Button>
                      <Button type="button" variant="outline" onClick={() => void copyText(twoFactorSetup.otpauthUrl, "Authenticator URI")}>
                        Copy authenticator URI
                      </Button>
                    </div>
                  </div>
                </div>
                <form className="space-y-4" onSubmit={handleEnableTwoFactor}>
                  <Input
                    label="Enter code from authenticator app"
                    value={twoFactorSetupCode}
                    onChange={(event) => setTwoFactorSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  {twoFactorSetupError ? <InlineError message={twoFactorSetupError} /> : null}
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => { setTwoFactorSetup(null); setTwoFactorSetupError(null); setTwoFactorSetupCode(""); }}>
                      Cancel setup
                    </Button>
                    <Button type="submit" isLoading={enableTwoFactorMutation.isPending}>
                      Verify and enable 2FA
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleStartTwoFactorSetup}>
                <p className="text-sm leading-6 text-text-secondary">
                  Use an authenticator app such as Google Authenticator, Microsoft Authenticator, Authy, or 1Password. You can disable 2FA later from this same page using your password and a valid authenticator code.
                </p>
                <PasswordInput
                  label="Current Password"
                  value={twoFactorPassword}
                  onChange={(event) => setTwoFactorPassword(event.target.value)}
                  hint="Required before generating a new authenticator secret."
                />
                {twoFactorSetupError ? <InlineError message={twoFactorSetupError} /> : null}
                <div className="pt-2">
                  <Button type="submit" variant="outline" isLoading={startTwoFactorSetupMutation.isPending}>
                    Enable 2FA
                  </Button>
                </div>
              </form>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Current Session</CardTitle>
                <CardDescription>Review the current cookie-backed session and revoke active sessions if needed.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Session status" value={sessionExpiresAt ? `Active until ${new Date(sessionExpiresAt).toLocaleString()}` : "Active session"} />
              <SummaryItem label="Permission mode" value={user?.adminRole ? formatAdminRole(user.adminRole) : "Legacy full admin"} />
            </div>
            <div className="pt-2">
              <Button variant="outline" isLoading={forceLogoutMutation.isPending} onClick={handleRevokeCurrentSessions}>
                Sign out all sessions
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    if (location.pathname === appRoutes.settingsSystem) {
      if (settingsQuery.isPending || platformQuery.isPending) return <SectionLoader />;
      if (settingsQuery.isError || !settingsQuery.data) {
        return <ErrorState title="Unable to load frontend settings" description="The frontend runtime settings could not be loaded." onAction={() => void settingsQuery.refetch()} />;
      }
      if (platformQuery.isError || !platformQuery.data) {
        return <ErrorState title="Unable to load platform configuration" description="The platform config endpoint is not available." onAction={() => void platformQuery.refetch()} />;
      }

      return (
        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Runtime Config</CardTitle>
                <CardDescription>Frontend shell values loaded from the current environment.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="API URL" value={settingsQuery.data.apiBaseUrl} />
              <SummaryItem label="Environment" value={settingsQuery.data.appEnv} />
              <SummaryItem label="Request timeout" value={`${settingsQuery.data.requestTimeout} ms`} />
              <SummaryItem label="Mock mode" value={settingsQuery.data.mockModeEnabled ? "Enabled" : "Disabled"} />
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Platform Defaults</CardTitle>
                <CardDescription>Server-provided defaults used for subscriptions and infrastructure provisioning.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Router monthly price" value={String(platformQuery.data.routerMonthlyPrice)} />
              <SummaryItem label="Trial period" value={`${platformQuery.data.trialDays} days`} />
              <SummaryItem label="Server region" value={platformQuery.data.serverRegion} />
              <SummaryItem label="App version" value={platformQuery.data.appVersion} />
            </div>
            <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-sm text-text-secondary">
              <p>These values are configured via environment variables on the server. Contact your system administrator to modify them.</p>
              <p className="mt-3">Audit logs are retained indefinitely. Configure log retention in server environment variables (`LOG_RETENTION_DAYS`).</p>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{view.title}</CardTitle>
            <CardDescription>{view.description}</CardDescription>
          </div>
        </CardHeader>
        <p className="text-sm text-text-secondary">
          This area has its own dedicated page. Use the shortcut card on the right or the settings tabs above to open it.
        </p>
      </Card>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title={`Settings · ${view.title}`} description={view.description} meta={env.appEnv} />
        {(location.pathname === appRoutes.settingsSystem) ? <RefreshButton loading={platformQuery.isFetching} onClick={() => void platformQuery.refetch()} /> : null}
      </div>

      <Tabs tabs={[...visibleTabs]} value={location.pathname} onChange={navigate} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <div className="space-y-5">
          <Card className="space-y-5">
            <CardHeader className="mb-0">
              <div className="flex items-start gap-4">
                <div className="icon-block-highlight rounded-2xl p-3">
                  <ViewIcon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>{view.title}</CardTitle>
                  <CardDescription>{view.description}</CardDescription>
                </div>
              </div>
              <Badge tone="info">{user ? "Authenticated session active" : "No active operator session"}</Badge>
            </CardHeader>

            <div className="grid gap-3 md:grid-cols-2">
              <SummaryItem label="Operator" value={user?.name ?? "Unknown operator"} />
              <SummaryItem label="Email" value={user?.email ?? "No email available"} />
              <SummaryItem label="Role" value={user?.role ?? "No role loaded"} />
              <SummaryItem label="Admin scope" value={formatAdminRole(user?.adminRole)} />
            </div>
          </Card>

          {renderMainContent()}
        </div>

        <Card className="space-y-4">
          <CardHeader className="mb-0">
            <div>
              <CardTitle>Settings Areas</CardTitle>
              <CardDescription>Jump between operator profile, system controls, and final-module admin surfaces.</CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-2">
            {settingsLinks.map((link) => (
              <Link key={link.path} to={link.path} className="rounded-2xl border border-background-border bg-background-elevated/80 px-4 py-3 text-sm text-text-primary transition hover:border-primary/40 hover:bg-primary/10">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-background-border bg-background-elevated p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Operational note</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  The final module sweep adds profile mutation, admin account management, and service-plan management. Reseller tooling remains a future release.
                </p>
              </div>
            </div>
          </div>

          <Link to={appRoutes.dashboard}>
            <Button variant="secondary" className="w-full" leftIcon={<BadgeCheck className="h-4 w-4" />}>
              Return to dashboard
            </Button>
          </Link>
        </Card>
      </div>
    </section>
  );
}
