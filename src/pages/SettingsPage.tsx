import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, Palette, Settings } from 'lucide-react';
import PageTransition from '../app/PageTransition';
import ThemeToggle from '../components/ThemeToggle';
import { cn } from '../lib/utils';

function ToggleRow({
  label,
  description,
  pressed,
  onToggle,
}: {
  label: string;
  description?: string;
  pressed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-tbank-border/80 last:border-0 dark:border-white/[0.06]">
      <div className="min-w-0">
        <p className="text-sm font-medium text-tbank-black dark:text-white">{label}</p>
        {description ? (
          <p className="text-xs text-stone-500 mt-1 dark:text-white/40">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={pressed}
        onClick={onToggle}
        className={cn(
          'relative h-8 w-[52px] shrink-0 rounded-full transition-colors',
          pressed ? 'bg-brand' : 'bg-stone-200 dark:bg-white/[0.12]',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200',
            pressed ? 'translate-x-[22px]' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Palette;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-tbank-border bg-white p-5 shadow-card dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={18} className="text-brand" />
        <h2 className="text-base font-bold text-tbank-black dark:text-white font-display">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

export default function SettingsPage() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Settings size={18} className="text-brand" />
          <h1 className="text-xl font-bold text-tbank-black dark:text-white font-display">Settings</h1>
        </div>
        <p className="text-sm text-stone-500 dark:text-white/45 -mt-2 mb-2">
          Mock UI — позже можно связать с <code className="text-xs bg-tbank-gray dark:bg-white/10 px-1.5 py-0.5 rounded">PATCH /api/me</code> и
          предпочтениями.
        </p>

        <Section icon={Palette} title="Appearance">
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-sm font-medium text-tbank-black dark:text-white">Theme</p>
              <p className="text-xs text-stone-500 mt-1 dark:text-white/40">Light or dark interface</p>
            </div>
            <ThemeToggle />
          </div>
        </Section>

        <Section icon={Bell} title="Notifications">
          <div className="mt-2">
            <ToggleRow
              label="Email digest"
              description="Weekly summary of activity"
              pressed={emailNotif}
              onToggle={() => setEmailNotif((v) => !v)}
            />
            <ToggleRow
              label="Push notifications"
              description="Likes, comments, new followers"
              pressed={pushNotif}
              onToggle={() => setPushNotif((v) => !v)}
            />
          </div>
        </Section>

        <Section icon={Lock} title="Privacy">
          <div className="mt-2">
            <ToggleRow
              label="Public profile"
              description="Others can see your posts and followers"
              pressed={profilePublic}
              onToggle={() => setProfilePublic((v) => !v)}
            />
          </div>
        </Section>
      </div>
    </PageTransition>
  );
}
