import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/auth.store";
import { InlineError } from "@/components/feedback/InlineError";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { queryKeys } from "@/config/queryKeys";
import { appRoutes } from "@/config/routes";
import { LoginProgressDialog } from "@/features/auth/components/LoginProgressDialog";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/auth.schema";
import { useLogin, useVerifyTwoFactorLogin } from "@/features/auth/hooks/useLogin";
import type { AuthSession, TwoFactorChallenge } from "@/types/auth/auth.types";

const LOGIN_TOAST_ID = "auth-login-progress";
const MIN_VALIDATING_MS = 1800;
const REDIRECTING_MS = 2400;
const FAILED_VALIDATING_MS = 1200;

export function LoginForm() {
  const mutation = useLogin();
  const twoFactorMutation = useVerifyTwoFactorLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);
  const [progressStage, setProgressStage] = useState<"idle" | "validating" | "redirecting">("idle");
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const startedAtRef = useRef<number>(0);
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

  async function handleLogin(values: LoginSchema) {
    startedAtRef.current = Date.now();
    setProgressStage("validating");
    toast.loading("Validating credentials...", {
      id: LOGIN_TOAST_ID,
      duration: Infinity,
    });

    try {
      const session = await mutation.mutateAsync({
        ...values,
        rememberDevice,
      });
      const validatingElapsed = Date.now() - startedAtRef.current;
      const remainingValidation = Math.max(0, MIN_VALIDATING_MS - validatingElapsed);
      if (remainingValidation > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingValidation));
      }

      if ("requiresTwoFactor" in session && session.requiresTwoFactor) {
        setChallenge(session);
        setProgressStage("idle");
        toast.success("Authenticator code required to finish sign-in.", {
          id: LOGIN_TOAST_ID,
          duration: 3600,
        });
        return;
      }

      const resolvedSession = session as AuthSession;
      setSession(resolvedSession.user, resolvedSession.sessionExpiresAt);
      queryClient.setQueryData(queryKeys.me, resolvedSession.user);
      setProgressStage("redirecting");
      toast.success("Credentials verified. Redirecting to dashboard...", {
        id: LOGIN_TOAST_ID,
        duration: REDIRECTING_MS + 300,
      });
      await new Promise((resolve) => window.setTimeout(resolve, REDIRECTING_MS));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const validatingElapsed = Date.now() - startedAtRef.current;
      const remainingValidation = Math.max(0, FAILED_VALIDATING_MS - validatingElapsed);
      if (remainingValidation > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingValidation));
      }

      toast.error(error instanceof Error ? error.message : "Wrong details. Please try again.", {
        id: LOGIN_TOAST_ID,
        duration: 3600,
      });
      setProgressStage("idle");
    }
  }

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;

    startedAtRef.current = Date.now();
    setProgressStage("validating");
    toast.loading("Validating authenticator code...", {
      id: LOGIN_TOAST_ID,
      duration: Infinity,
    });

    try {
      const session = await twoFactorMutation.mutateAsync({
        challengeToken: challenge.challengeToken,
        code: twoFactorCode.trim(),
      });
      const validatingElapsed = Date.now() - startedAtRef.current;
      const remainingValidation = Math.max(0, MIN_VALIDATING_MS - validatingElapsed);
      if (remainingValidation > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingValidation));
      }

      setSession(session.user, session.sessionExpiresAt);
      queryClient.setQueryData(queryKeys.me, session.user);
      setProgressStage("redirecting");
      toast.success("Two-factor verified. Redirecting to dashboard...", {
        id: LOGIN_TOAST_ID,
        duration: REDIRECTING_MS + 300,
      });
      await new Promise((resolve) => window.setTimeout(resolve, REDIRECTING_MS));
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const validatingElapsed = Date.now() - startedAtRef.current;
      const remainingValidation = Math.max(0, FAILED_VALIDATING_MS - validatingElapsed);
      if (remainingValidation > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingValidation));
      }

      toast.error(error instanceof Error ? error.message : "Invalid authenticator code.", {
        id: LOGIN_TOAST_ID,
        duration: 3600,
      });
      setProgressStage("idle");
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
          />

          {twoFactorMutation.isError ? (
            <InlineError message={twoFactorMutation.error instanceof Error ? twoFactorMutation.error.message : "Unable to verify authenticator code."} />
          ) : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setChallenge(null);
                setTwoFactorCode("");
                setProgressStage("idle");
              }}
            >
              Back
            </Button>
            <Button type="submit" size="lg" isLoading={twoFactorMutation.isPending} disabled={twoFactorCode.trim().length !== 6 || twoFactorMutation.isPending} className="flex-1">
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
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between gap-4 text-sm text-text-secondary">
            <Checkbox
              label="Remember this device"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
            />
            <span className="text-xs uppercase tracking-[0.18em] text-primary">Encrypted session</span>
          </div>

          {mutation.isError ? (
            <InlineError message={mutation.error instanceof Error ? mutation.error.message : "Unable to sign in. Check your credentials."} />
          ) : null}

          <Button type="submit" size="lg" isLoading={mutation.isPending} disabled={!isValid || mutation.isPending} className="mt-2 w-full">
            {mutation.isPending ? "Validating credentials..." : "Sign in to admin console"}
          </Button>
        </form>
      )}

      <LoginProgressDialog open={progressStage !== "idle"} stage={progressStage} />
    </>
  );
}
