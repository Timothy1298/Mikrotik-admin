import type { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-3 text-sm text-slate-300">
      <input type="checkbox" className="h-4 w-4 rounded border-brand-500/25 bg-[rgba(8,14,31,0.9)] text-brand-500 focus:ring-brand-500/35" {...props} />
      <span>{label}</span>
    </label>
  );
}
