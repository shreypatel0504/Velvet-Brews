import * as React from "react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
  spotlight?: boolean;
  tilt?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, spotlight = true, tilt = false, onMouseMove, onMouseLeave, ...props }, ref) => {
    const cardRef = React.useRef<HTMLDivElement | null>(null);
    const [rotateX, setRotateX] = React.useState(0);
    const [rotateY, setRotateY] = React.useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (spotlight) {
          el.style.setProperty("--mouse-x", `${x}px`);
          el.style.setProperty("--mouse-y", `${y}px`);
        }

        if (tilt) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rX = ((y - centerY) / centerY) * -5;
          const rY = ((x - centerX) / centerX) * 5;
          setRotateX(rX);
          setRotateY(rY);
        }
      }

      if (onMouseMove) {
        onMouseMove(e);
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (tilt) {
        setRotateX(0);
        setRotateY(0);
      }
      if (onMouseLeave) {
        onMouseLeave(e);
      }
    };

    return (
      <motion.div
        ref={(node) => {
          cardRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        animate={tilt ? { rotateX, rotateY } : undefined}
        whileHover={{ y: -6, transition: { type: "spring", stiffness: 320, damping: 22 } }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "rounded-2xl border border-amber-950/10 bg-[var(--color-cafe-surface)] text-[var(--color-cafe-text-primary)] shadow-[var(--shadow-cafe-card)] overflow-hidden backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-cafe-primary)]/15",
          spotlight && "spotlight-card",
          tilt && "transform-gpu perspective-1000",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
