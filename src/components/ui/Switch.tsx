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
          checked ? "border-primary/40 bg-primary" : "border-background-border bg-background-panel",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-text-primary transition",
            checked ? "left-6" : "left-1",
          )}
        />
      </button>
      {label ? <span className="text-sm text-text-secondary">{label}</span> : null}
    </div>
  );
}
