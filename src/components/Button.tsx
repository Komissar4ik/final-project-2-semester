import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  // T-Bank style: bold yellow bg, near-black text
  primary:
    'bg-brand hover:bg-brand-dark text-tbank-black font-semibold shadow-glow hover:shadow-[0_0_32px_rgba(255,221,45,0.65)] dark:shadow-glow-dark',
  secondary:
    'bg-tbank-gray/90 text-tbank-black border border-tbank-border hover:bg-[#FFDD2D]/15 hover:border-[#FFDD2D]/50 dark:bg-white/[0.08] dark:text-white dark:border-white/[0.12] dark:hover:bg-[#FFDD2D]/10 dark:hover:border-brand/40',
  ghost:
    'text-stone-600 hover:text-tbank-black hover:bg-[#FFDD2D]/12 dark:text-white/60 dark:hover:text-white dark:hover:bg-[#FFDD2D]/10',
  danger:
    'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/25',
  outline:
    'border-2 border-brand text-tbank-black hover:bg-brand/10 dark:border-brand dark:text-brand dark:hover:bg-brand/10',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
