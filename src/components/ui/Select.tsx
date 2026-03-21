import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Option = { label: string; value: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: Option[];
};

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <label className="grid gap-2 text-sm text-text-primary">
      {label ? <span className="font-medium text-text-secondary">{label}</span> : null}
      <div className="relative">
        <select
          className={cn(
            "h-11 w-full appearance-none rounded-lg border border-background-border bg-background-panel px-4 text-text-primary outline-none transition-colors focus:border-primary/50 focus:bg-background-elevated",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      </div>
    </label>
  );
}
