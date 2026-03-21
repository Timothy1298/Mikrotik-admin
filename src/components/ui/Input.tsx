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
      <label className="grid gap-2 text-sm text-text-primary">
        {label ? <span className="font-medium text-text-secondary">{label}</span> : null}
        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">{leftIcon}</span>
          ) : null}
          <input
            ref={ref}
            className={cn(
              "h-11 w-full rounded-lg border border-background-border bg-background-panel px-4 text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:bg-background-elevated",
              leftIcon && "pl-11",
              rightElement && "pr-12",
              error && "border-danger/30 focus:border-danger/40",
              className,
            )}
            {...props}
          />
          {rightElement ? (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightElement}
            </span>
          ) : null}
        </div>
        {error ? (
          <span className="text-xs text-danger">{error}</span>
        ) : hint ? (
          <span className="text-xs text-text-muted">{hint}</span>
        ) : null}
      </label>
    );
  },
);

Input.displayName = "Input";
