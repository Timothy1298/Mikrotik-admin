import * as React from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "border border-brand-500/35 bg-[linear-gradient(135deg,#2563eb_0%,#38bdf8_100%)] text-white hover:opacity-95",
  secondary: "border border-brand-500/15 bg-[linear-gradient(135deg,rgba(37,99,235,0.1),rgba(56,189,248,0.05))] text-slate-200 hover:border-brand-500/25 hover:bg-[rgba(37,99,235,0.12)]",
  ghost: "border border-transparent bg-transparent text-slate-300 hover:border-brand-500/15 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100",
  danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-[rgba(239,68,68,0.14)]",
  outline: "border border-brand-500/15 bg-[rgba(8,14,31,0.9)] text-slate-200 hover:border-brand-500/35 hover:bg-[rgba(37,99,235,0.08)] hover:text-slate-100",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/35 disabled:cursor-not-allowed disabled:border-brand-500/12 disabled:bg-[rgba(37,99,235,0.08)] disabled:text-slate-500 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : leftIcon}
        <span>{children}</span>
        {!isLoading ? rightIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
