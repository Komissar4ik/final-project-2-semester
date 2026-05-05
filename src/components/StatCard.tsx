import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  className?: string;
}

export default function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        'rounded-2xl border border-tbank-border bg-white p-4 shadow-card',
        'dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-none',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone-500 dark:text-white/40 font-medium uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-tbank-black dark:text-white font-display">{value}</p>
          {trend && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{trend}</p>}
        </div>
        {icon && (
          <div className="p-2 rounded-xl bg-brand/20 text-tbank-black dark:text-tbank-black">{icon}</div>
        )}
      </div>
    </motion.div>
  );
}
