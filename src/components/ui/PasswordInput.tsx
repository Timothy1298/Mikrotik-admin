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
    const inputId = useMemo(() => id ?? `password-${Math.random().toString(36).slice(2, 9)}`, [id]);

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="flex items-center gap-1 text-sm font-medium text-text-secondary">
            <span>{label}</span>
            {required ? <span className="text-primary">*</span> : null}
          </label>
        ) : null}

        <div
          className={cn(
            "group flex h-11 items-center rounded-lg border bg-background-panel px-3 transition-colors",
            error
              ? "border-danger/30 focus-within:border-danger/30"
              : "border-background-border focus-within:border-primary/50 hover:border-primary/30",
            disabled ? "opacity-60" : "",
          )}
        >
          <LockKeyhole className="mr-3 h-4 w-4 text-text-muted transition group-focus-within:text-primary" />
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={visible ? "text" : "password"}
            disabled={disabled}
            className={cn(
              "h-full w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted",
              className,
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((state) => !state)}
            className="ml-3 rounded-full border border-transparent p-1 text-text-muted transition hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {!error && capsLockOn ? <p className="text-sm text-danger">Caps Lock is on</p> : null}
        {!error && hint ? <p className="text-sm text-text-muted">{hint}</p> : null}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
