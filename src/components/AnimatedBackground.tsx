import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Light: pure white base; Dark: near-black T-Bank style */}
      <div className="absolute inset-0 bg-white dark:bg-[#111214]" />

      {/* T-Bank yellow blobs — soft on light, vivid-accent on dark */}
      <motion.div
        className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full opacity-[0.18] dark:opacity-[0.10]"
        style={{ background: 'radial-gradient(circle, #FFDD2D 0%, transparent 70%)' }}
        animate={{ x: [0, 70, -20, 0], y: [0, -50, 90, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-48 w-[550px] h-[550px] rounded-full opacity-[0.12] dark:opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #FFDD2D 0%, transparent 70%)' }}
        animate={{ x: [0, -60, 30, 0], y: [0, 70, -40, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <motion.div
        className="absolute -bottom-48 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.10] dark:opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, #F5C800 0%, transparent 70%)' }}
        animate={{ x: [0, 50, -70, 0], y: [0, -60, 20, 0], scale: [1, 1.06, 0.97, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
      />

      {/* Very faint dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #1A1A1A 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
}
