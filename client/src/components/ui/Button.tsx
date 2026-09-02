import * as React from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/utils/cn";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cafe-primary)] disabled:pointer-events-none disabled:opacity-50 select-none shadow-sm active:shadow-inner cursor-pointer",
          {
            "bg-[var(--color-cafe-primary)] text-white hover:bg-[#7a5531] hover:shadow-md hover:shadow-[var(--color-cafe-primary)]/20 btn-crema-shine": variant === "primary",
            "bg-[var(--color-cafe-secondary)] text-white hover:bg-[#c29567] hover:shadow-md btn-crema-shine": variant === "secondary",
            "border border-[var(--color-cafe-primary)]/40 text-[var(--color-cafe-primary)] hover:bg-[#fcf9f5] hover:border-[var(--color-cafe-primary)]": variant === "outline",
            "hover:bg-[#f5eeeb] text-[var(--color-cafe-text-secondary)]": variant === "ghost",
            "h-8 px-3.5 text-xs rounded-lg": size === "sm",
            "h-10 px-5 text-sm rounded-xl": size === "md",
            "h-12 px-8 text-base rounded-xl font-semibold": size === "lg",
          },
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
