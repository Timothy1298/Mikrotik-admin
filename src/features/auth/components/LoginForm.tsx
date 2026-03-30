import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
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

  return (
    <>
      {challenge ? (
        <form className="grid gap-5" onSubmit={handleTwoFactorSubmit}>
          <div className="rounded-2xl border border-background-border bg-background-elevated/80 p-4 text-sm text-text-secondary">
            Enter the 6-digit code from your authenticator app for <span className="font-medium text-text-primary">{challenge.user.email}</span>.
          </div>

          <Input
            label="Authenticator code"
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            value={twoFactorCode}
            onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={twoFactorMutation.isPending}
          />

          {twoFactorMutation.isError ? (
            <InlineError message={twoFactorMutation.error instanceof Error ? twoFactorMutation.error.message : "Unable to verify authenticator code."} />
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={twoFactorMutation.isPending}
              onClick={() => {
                setChallenge(null);
                setTwoFactorCode("");
                setIdleState();
                toast.dismiss(LOGIN_TOAST_ID);
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              isLoading={twoFactorMutation.isPending}
              disabled={twoFactorCode.trim().length !== 6 || twoFactorMutation.isPending}
              className="flex-1"
            >
              {twoFactorMutation.isPending ? "Verifying code..." : "Complete sign in"}
            </Button>
          </div>
        </form>
      ) : (
        <form className="grid gap-5" onSubmit={handleSubmit(handleLogin)}>
          <Input
            label="Email address"
            placeholder="admin@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            disabled={mutation.isPending}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            disabled={mutation.isPending}
            {...register("password")}
          />

          <div className="flex items-center justify-between gap-4 text-sm text-text-secondary">
            <Checkbox
              label="Remember this device"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
              disabled={mutation.isPending}
            />
            <span className="text-xs uppercase tracking-[0.18em] text-primary">Encrypted session</span>
          </div>

          {mutation.isError ? (
            <InlineError message={mutation.error instanceof Error ? mutation.error.message : "Unable to sign in. Check your credentials."} />
          ) : null}

          <Button
            type="submit"
            size="lg"
            isLoading={mutation.isPending}
            disabled={!isValid || mutation.isPending}
            className="mt-2 w-full"
          >
            {mutation.isPending ? "Validating credentials..." : "Sign in to admin console"}
          </Button>
        </form>
      )}

      <LoginProgressDialog open={loginStage !== "idle"} stage={loginStage} />
    </>
  );
}
