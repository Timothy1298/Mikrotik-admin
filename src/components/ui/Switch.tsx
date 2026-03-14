import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SwitchProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
  label?: string;
};

export function Switch({ checked, label, className, ...props }: SwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={cn(
          "relative h-7 w-12 rounded-full border transition",
          checked ? "border-brand-500/35 bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_100%)]" : "border-brand-500/15 bg-[rgba(8,14,31,0.9)]",
          className,
        )}
        {...props}
      >
        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
      </button>
      {label ? <span className="text-sm text-slate-300">{label}</span> : null}
    </div>
  );
}
