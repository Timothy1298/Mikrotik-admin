import * as React from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightElement, ...props }, ref) => {
    return (
      <label className="grid gap-2 text-sm text-slate-200">
        {label ? <span className="font-medium text-slate-300">{label}</span> : null}
        <div className="relative">
          {leftIcon ? <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">{leftIcon}</span> : null}
          <input
            ref={ref}
            className={cn(
              "h-12 w-full rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-500/35",
              leftIcon && "pl-11",
              rightElement && "pr-12",
              error && "border-danger/30 focus:border-danger/30",
              className,
            )}
            {...props}
          />
          {rightElement ? <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{rightElement}</span> : null}
        </div>
        {error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </label>
    );
  },
);

Input.displayName = "Input";
