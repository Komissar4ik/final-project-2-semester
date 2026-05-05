import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { cn } from '../lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, toggle } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
        // Light: white with T-Bank border, icon is dark
        'border-tbank-border bg-white text-tbank-black shadow-card',
        'hover:border-brand/60 hover:bg-brand/10',
        // Dark: dark panel, icon is yellow
        'dark:border-white/10 dark:bg-white/[0.06] dark:text-brand dark:shadow-none',
        'dark:hover:border-brand/40 dark:hover:bg-brand/10',
        className,
      )}
    >
      <motion.span
        key={mode}
        initial={{ rotate: -45, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </motion.span>
    </motion.button>
  );
}
