import { forwardRef, useMemo, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PasswordInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
  capsLockOn?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      containerClassName,
      label,
      hint,
      error,
      capsLockOn,
      id,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [visible, setVisible] = useState(false);
    const inputId = useMemo(
      () => id ?? `password-${Math.random().toString(36).slice(2, 9)}`,
      [id],
    );

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 text-sm font-medium text-slate-200"
          >
            <span>{label}</span>
            {required ? <span className="text-brand-100">*</span> : null}
          </label>
        ) : null}

        <div
          className={cn(
            "group flex h-12 items-center rounded-2xl border bg-[rgba(8,14,31,0.9)] px-3 transition",
            error
              ? "border-danger/30 focus-within:border-danger/30"
              : "border-brand-500/15 focus-within:border-brand-500/35 hover:border-brand-500/25",
            disabled ? "opacity-60" : "",
          )}
        >
          <LockKeyhole className="mr-3 h-4 w-4 text-slate-500 transition group-focus-within:text-brand-100" />
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            disabled={disabled}
            className={cn(
              "h-full w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500",
              className,
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((state) => !state)}
            className="ml-3 rounded-full border border-transparent p-1 text-slate-500 transition hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-200"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!error && capsLockOn ? <p className="text-sm text-danger">Caps Lock is on</p> : null}
        {!error && hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
