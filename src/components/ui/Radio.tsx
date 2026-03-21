import type { InputHTMLAttributes } from "react";

type RadioProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Radio({ label, ...props }: RadioProps) {
  return (
    <label className="inline-flex items-center gap-3 text-sm text-text-secondary">
      <input
        type="radio"
        className="h-4 w-4 border-background-border bg-background-panel text-primary focus:ring-primary/35"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
