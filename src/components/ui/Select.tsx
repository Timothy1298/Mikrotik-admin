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
    <label className="grid gap-2 text-sm text-slate-200">
      {label ? <span className="font-medium text-slate-300">{label}</span> : null}
      <div className="relative">
        <select
          className={cn(
            "h-12 w-full appearance-none rounded-2xl border border-brand-500/15 bg-[rgba(8,14,31,0.9)] px-4 text-slate-100 outline-none transition focus:border-brand-500/35",
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
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </label>
  );
}
