import * as React from "react";
import { cn } from "@/lib/utils/cn";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <label className="grid gap-2 text-sm text-slate-200">
      {label ? <span className="font-medium text-slate-300">{label}</span> : null}
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] p-4 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-brand-500/35",
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
