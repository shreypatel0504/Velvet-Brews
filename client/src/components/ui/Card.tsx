import * as React from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    className={cn(
      "rounded-2xl border border-amber-950/5 bg-[var(--color-cafe-surface)] text-[var(--color-cafe-text-primary)] shadow-[var(--shadow-cafe-card)] overflow-hidden backdrop-blur-md transition-shadow duration-300 hover:shadow-xl hover:shadow-[var(--color-cafe-primary)]/10",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card };
