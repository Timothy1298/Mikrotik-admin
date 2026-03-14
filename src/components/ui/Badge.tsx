import { cn } from "@/lib/utils/cn";

const toneStyles = {
  neutral: "border-brand-500/15 bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))] text-slate-200",
  info: "border-brand-500/25 bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))] text-brand-100",
  success: "border-brand-500/25 bg-[linear-gradient(90deg,rgba(37,99,235,0.12),rgba(56,189,248,0.05))] text-brand-100",
  warning: "border-[rgba(139,92,246,0.25)] bg-[linear-gradient(90deg,rgba(124,58,237,0.15),rgba(139,92,246,0.06))] text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export function Badge({ className, tone = "neutral", children }: { className?: string; tone?: keyof typeof toneStyles; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.15em] font-mono", toneStyles[tone], className)}>{children}</span>;
}
