import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import type { HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  glow?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  hover = false,
  glow = false,
  className,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        // Light: pure white card with thin border, T-Bank style
        'relative rounded-2xl border border-tbank-border bg-white shadow-card',
        // Dark: glass panel
        'dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-glass-dark dark:backdrop-blur-xl',
        hover &&
          'cursor-pointer transition-all duration-200 hover:border-brand/60 hover:shadow-glow dark:hover:border-brand/30',
        glow && 'shadow-glow dark:shadow-glow-dark',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
