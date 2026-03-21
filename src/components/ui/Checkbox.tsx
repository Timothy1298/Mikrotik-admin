import type { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Checkbox({ label, ...props }: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-3 text-sm text-text-secondary">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-background-border bg-background-panel text-primary focus:ring-primary/35"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
