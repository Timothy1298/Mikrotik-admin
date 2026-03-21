import * as React from "react";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary: "border border-primary bg-primary text-text-primary hover:border-primary-hover hover:bg-primary-hover",
  secondary: "border border-background-border bg-background-elevated text-text-primary hover:border-primary/40 hover:bg-primary/10",
  ghost: "border border-transparent bg-transparent text-text-secondary hover:border-primary/20 hover:bg-primary/10 hover:text-text-primary",
  danger: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
  outline: "border border-background-border bg-background-panel text-text-secondary hover:border-primary/40 hover:bg-primary/10 hover:text-text-primary",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
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
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:border-background-border disabled:bg-background-elevated disabled:text-text-muted",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading ? rightIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";
