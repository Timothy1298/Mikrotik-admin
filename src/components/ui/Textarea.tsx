import * as React from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <label className="grid gap-2 text-sm text-text-primary">
      {label ? <span className="font-medium text-text-secondary">{label}</span> : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-xl border border-background-border bg-background-panel p-4 text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary/50 focus:bg-background-elevated",
          error && "border-danger/30",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  ),
);

Textarea.displayName = "Textarea";
