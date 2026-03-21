import { cn } from "@/lib/utils/cn";

const toneStyles = {
  neutral: "border-background-border bg-background-elevated text-text-secondary",
  info: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-primary/25 bg-primary/10 text-text-primary",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: keyof typeof toneStyles;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.15em]",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
