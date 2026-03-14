import type { InputHTMLAttributes } from "react";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Radio({ label, ...props }: RadioProps) {
  return (
    <label className="inline-flex items-center gap-3 text-sm text-slate-300">
      <input type="radio" className="h-4 w-4 border-brand-500/25 bg-[rgba(8,14,31,0.9)] text-brand-500 focus:ring-brand-500/35" {...props} />
      <span>{label}</span>
    </label>
  );
}
