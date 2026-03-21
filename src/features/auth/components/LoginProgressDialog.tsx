import { CheckCircle2, ShieldCheck } from "lucide-react";
import { createPortal } from "react-dom";

type LoginProgressDialogProps = {
  open: boolean;
  stage: "validating" | "redirecting" | "idle";
};

export function LoginProgressDialog({ open, stage }: LoginProgressDialogProps) {
  if (!open || stage === "idle" || typeof document === "undefined") return null;

  const redirecting = stage === "redirecting";

  return createPortal(
    <div className="fixed inset-0 z-[80] flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.22),rgba(2,6,23,0.96)_50%)] p-4 backdrop-blur-xl sm:p-6">
      <div className="absolute inset-0 bg-[rgba(2,6,23,0.45)]" />
      <div className="relative surface-card-3d w-full max-w-lg animate-fade-up overflow-hidden p-7 text-center sm:p-8">
        <div className="absolute inset-x-0 top-0 h-px bg-primary/30" />
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/20 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.2),rgba(37,99,235,0.08)_55%,rgba(8,14,31,0.12))] text-primary shadow-[0_0_50px_rgba(37,99,235,0.16)]">
          {redirecting ? (
            <CheckCircle2 className="h-10 w-10" />
          ) : (
            <div className="relative flex h-11 w-11 items-center justify-center">
              <span className="absolute h-11 w-11 rounded-full border border-primary/20" />
              <span className="absolute h-11 w-11 animate-spin rounded-full border-2 border-primary/80 border-r-transparent border-b-transparent" />
              <span className="absolute h-7 w-7 animate-spin rounded-full border-2 border-sky-300/70 border-l-transparent border-t-transparent [animation-direction:reverse] [animation-duration:1.4s]" />
            </div>
          )}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          <ShieldCheck className="h-4 w-4" />
          Secure admin access
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-text-primary">
          {redirecting ? "Verified, redirecting" : "Validating credentials"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
          {redirecting
            ? "Your credentials are verified and the admin workspace is being prepared."
            : "Checking your credentials and restoring the authenticated admin session."}
        </p>
        <div className="mt-6 overflow-hidden rounded-full border border-background-border bg-background-panel p-1">
          <div
            className={`h-2 rounded-full bg-primary transition-all duration-700 ${
              redirecting ? "w-full" : "w-2/3 animate-pulse"
            }`}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
