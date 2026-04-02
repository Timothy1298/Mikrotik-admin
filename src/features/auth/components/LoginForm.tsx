import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { queryKeys } from "@/config/queryKeys";
import { appRoutes } from "@/config/routes";
import { LoginProgressDialog } from "@/features/auth/components/LoginProgressDialog";
import { useLogin, useVerifyTwoFactorLogin } from "@/features/auth/hooks/useLogin";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/auth.schema";
import type { AuthSession, TwoFactorChallenge } from "@/types/auth/auth.types";

const LOGIN_TOAST_ID = "auth-login-progress";
const TOAST_DURATION_MS = 3000;

type LoginStage = "idle" | "validating" | "redirecting";

export function LoginForm() {
  const mutation = useLogin();
  const twoFactorMutation = useVerifyTwoFactorLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const isMountedRef = useRef(true);
  const redirectStageRef = useRef(false);

  const [loginStage, setLoginStage] = useState<LoginStage>("idle");
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? appRoutes.dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      toast.dismiss(LOGIN_TOAST_ID);
    };
  }, []);

  function setIdleState() {
    redirectStageRef.current = false;
    if (!isMountedRef.current) return;
    setLoginStage("idle");
  }

  function beginValidation(message: string) {
    redirectStageRef.current = false;
    setLoginStage("validating");
    toast.loading(message, {
      id: LOGIN_TOAST_ID,
      duration: Infinity,
    });
  }

  function beginRedirect(message: string) {
    redirectStageRef.current = true;
    if (!isMountedRef.current) return;
    setLoginStage("redirecting");
    toast.success(message, {
      id: LOGIN_TOAST_ID,
      duration: TOAST_DURATION_MS,
    });
  }

  function showError(message: string) {
    redirectStageRef.current = false;
    if (!isMountedRef.current) return;
    setLoginStage("idle");
    toast.error(message, {
      id: LOGIN_TOAST_ID,
      duration: TOAST_DURATION_MS,
    });
  }

  async function handleLogin(values: LoginSchema) {
    beginValidation("Validating credentials...");

    try {
      const session = await mutation.mutateAsync({
        ...values,
        rememberDevice,
      });

      if ("requiresTwoFactor" in session && session.requiresTwoFactor) {
        if (!isMountedRef.current) return;
        setChallenge(session);
        setTwoFactorCode("");
        setIdleState();
        toast.success("Authenticator code required to finish sign-in.", {
          id: LOGIN_TOAST_ID,
          duration: TOAST_DURATION_MS,
        });
        return;
      }

      if (!isMountedRef.current) return;

      const resolvedSession = session as AuthSession;
      setSession(resolvedSession.user, resolvedSession.sessionExpiresAt);
      queryClient.setQueryData(queryKeys.me, resolvedSession.user);

      beginRedirect("Credentials verified. Redirecting to dashboard...");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showError(error instanceof Error ? error.message : "Wrong details. Please try again.");
    } finally {
      if (!redirectStageRef.current) {
        setIdleState();
      }
    }
  }

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge || twoFactorCode.trim().length !== 6) return;

    beginValidation("Validating authenticator code...");

    try {
      const session = await twoFactorMutation.mutateAsync({
        challengeToken: challenge.challengeToken,
        code: twoFactorCode.trim(),
      });

      if (!isMountedRef.current) return;

      setSession(session.user, session.sessionExpiresAt);
      queryClient.setQueryData(queryKeys.me, session.user);

      beginRedirect("Two-factor verified. Redirecting to dashboard...");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showError(error instanceof Error ? error.message : "Invalid authenticator code.");
    } finally {
      if (!redirectStageRef.current) {
        setIdleState();
      }
    }
  }

  const fieldLabelClass = "mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[#7a9db5]";
  const inputClass =
    "w-full rounded-[3px] border border-[rgba(0,212,255,0.15)] bg-[#0b1220] px-4 py-3 font-mono text-sm text-text-primary outline-none transition duration-200 placeholder:text-[#3a5a70] focus:border-[#00d4ff] focus:bg-[rgba(0,212,255,0.04)] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.18)] disabled:cursor-not-allowed disabled:opacity-60";
  const panelClass =
    "rounded-[3px] border border-[rgba(0,212,255,0.15)] bg-[rgba(11,18,32,0.9)] p-4 font-mono text-xs tracking-[0.04em] text-[#8db2c8]";
  const actionButtonClass =
    "relative w-full overflow-hidden rounded-[3px] border border-[#00d4ff] px-4 py-3 font-semibold uppercase tracking-[0.28em] transition duration-300";

  return (
    <>
      <section className="relative overflow-hidden rounded-[4px] border border-[rgba(0,212,255,0.15)] bg-[#0f1a2e] shadow-[0_0_0_1px_rgba(0,212,255,0.04),0_24px_64px_rgba(0,0,0,0.6),inset_0_0_40px_rgba(0,212,255,0.04)]">
        <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#00d4ff]" />
        <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#00d4ff]" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-[#00d4ff]" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#00d4ff]" />
        <div className="h-[3px] w-full bg-[linear-gradient(90deg,transparent,#00d4ff,transparent)] bg-[length:200%_100%] animate-[shimmer_4s_linear_infinite]" />

        <div className="flex items-center justify-between border-b border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] px-6 py-4">
          <span className="font-semibold uppercase tracking-[0.2em] text-[#00d4ff]">
            {challenge ? "Two-factor challenge" : "Administrator access"}
          </span>
          <span className="rounded-[2px] border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.06)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#3a5a70]">
            {challenge ? "2FA REQUIRED" : "AUTH REQUIRED"}
          </span>
        </div>

        <div className="px-5 py-7 sm:px-7">
          {challenge ? (
            <form className="grid gap-5" onSubmit={handleTwoFactorSubmit}>
              <div className={panelClass}>
                Enter the 6-digit authenticator code for <span className="text-text-primary">{challenge.user.email}</span>.
              </div>

              {twoFactorMutation.isError ? (
                <div className="flex items-center gap-3 rounded-[3px] border border-[rgba(255,68,68,0.35)] bg-[rgba(255,68,68,0.08)] px-4 py-3 font-mono text-xs tracking-[0.04em] text-[#ff7070]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{twoFactorMutation.error instanceof Error ? twoFactorMutation.error.message : "Unable to verify authenticator code."}</span>
                </div>
              ) : null}

              <div>
                <label htmlFor="two-factor-code" className={fieldLabelClass}>
                  <ShieldCheck className="h-3.5 w-3.5 text-[#00d4ff]" />
                  Authenticator code
                </label>
                <input
                  id="two-factor-code"
                  className={inputClass}
                  placeholder="123456"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={twoFactorMutation.isPending}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-[3px] border border-[rgba(0,212,255,0.2)] px-4 py-3 font-semibold uppercase tracking-[0.2em] text-[#7a9db5] transition hover:border-[#00d4ff] hover:text-[#00d4ff] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={twoFactorMutation.isPending}
                  onClick={() => {
                    setChallenge(null);
                    setTwoFactorCode("");
                    setIdleState();
                    toast.dismiss(LOGIN_TOAST_ID);
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={twoFactorCode.trim().length !== 6 || twoFactorMutation.isPending}
                  className={`${actionButtonClass} bg-transparent text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#03111a] disabled:cursor-not-allowed disabled:border-[rgba(0,212,255,0.18)] disabled:text-[#3a5a70] disabled:hover:bg-transparent disabled:hover:text-[#3a5a70]`}
                >
                  <span className={twoFactorMutation.isPending ? "opacity-0" : "opacity-100"}>
                    Complete sign in
                  </span>
                  {twoFactorMutation.isPending ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
                    </span>
                  ) : null}
                </button>
              </div>
            </form>
          ) : (
            <form className="grid gap-5" onSubmit={handleSubmit(handleLogin)}>
              {mutation.isError ? (
                <div className="flex items-center gap-3 rounded-[3px] border border-[rgba(255,68,68,0.35)] bg-[rgba(255,68,68,0.08)] px-4 py-3 font-mono text-xs tracking-[0.04em] text-[#ff7070]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{mutation.error instanceof Error ? mutation.error.message : "Unable to sign in. Check your credentials."}</span>
                </div>
              ) : null}

              <div>
                <label htmlFor="login-email" className={fieldLabelClass}>
                  <Mail className="h-3.5 w-3.5 text-[#00d4ff]" />
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@example.com"
                    autoComplete="username"
                    disabled={mutation.isPending}
                    className={`${inputClass} pr-11 ${errors.email ? "border-danger/50 focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.16)]" : ""}`}
                    {...register("email")}
                  />
                  <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3a5a70]" />
                </div>
                {errors.email?.message ? <p className="mt-2 text-sm text-danger">{errors.email.message}</p> : null}
              </div>

              <div>
                <label htmlFor="login-password" className={fieldLabelClass}>
                  <KeyRound className="h-3.5 w-3.5 text-[#00d4ff]" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={mutation.isPending}
                    className={`${inputClass} pr-12 ${errors.password ? "border-danger/50 focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.16)]" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    tabIndex={-1}
                    onClick={() => setPasswordVisible((state) => !state)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#3a5a70] transition hover:text-[#00d4ff]"
                  >
                    {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password?.message ? <p className="mt-2 text-sm text-danger">{errors.password.message}</p> : null}
              </div>

              <div className="flex flex-col gap-4 text-sm text-[#7a9db5] sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={rememberDevice}
                    onChange={(event) => setRememberDevice(event.target.checked)}
                    disabled={mutation.isPending}
                  />
                  <span className="flex h-[15px] w-[15px] items-center justify-center rounded-[2px] border border-[rgba(0,212,255,0.45)] bg-[#0b1220] text-[10px] text-[#03111a] transition peer-checked:bg-[#00d4ff] peer-disabled:opacity-60">
                    {rememberDevice ? "✓" : ""}
                  </span>
                  <span className="text-xs">Keep session active</span>
                </label>

                <Link
                  to={appRoutes.forgotPassword}
                  className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#0099bb] transition hover:text-[#00d4ff]"
                >
                  Reset access →
                </Link>
              </div>

              <button
                type="submit"
                disabled={!isValid || mutation.isPending}
                className={`${actionButtonClass} mt-1 bg-transparent text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#03111a] disabled:cursor-not-allowed disabled:border-[rgba(0,212,255,0.18)] disabled:text-[#3a5a70] disabled:hover:bg-transparent disabled:hover:text-[#3a5a70]`}
              >
                <span className={mutation.isPending ? "opacity-0" : "opacity-100"}>
                  Sign in to admin console
                </span>
                {mutation.isPending ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00d4ff] border-t-transparent" />
                  </span>
                ) : null}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.02)] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#3a5a70] sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span>
            Router: <span className="text-[#0099bb]">192.168.88.1</span>
          </span>
          <span>
            Firmware: <span className="text-[#0099bb]">RouterOS v7</span>
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            TLS secured
          </span>
        </div>
      </section>

      <LoginProgressDialog open={loginStage !== "idle"} stage={loginStage} />
    </>
  );
}
