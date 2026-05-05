import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export default function FeatureCard({ icon, title, description, gradient }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-3xl border border-tbank-border bg-white p-6 overflow-hidden cursor-default shadow-card
        dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
    >
      {/* Yellow glow on hover */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl ${gradient}`}
      />

      <div className="relative z-10">
        <div className="inline-flex p-3 rounded-2xl mb-4 bg-brand/20 group-hover:bg-brand/30 transition-colors">
          <div className="text-tbank-black">{icon}</div>
        </div>
        <h3 className="text-lg font-semibold text-tbank-black dark:text-white mb-2 font-display">
          {title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-white/50 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
