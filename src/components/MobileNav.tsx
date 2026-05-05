import { NavLink } from 'react-router-dom';
import { Home, User, Users } from 'lucide-react';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { to: '/app/feed', icon: Home, label: 'Feed' },
  { to: '/app/users', icon: Users, label: 'People' },
  { to: '/app/profile/me', icon: User, label: 'Me' },
];

export default function MobileNav() {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center
      border-t border-tbank-border bg-white/95 backdrop-blur-sm px-6 py-2 safe-bottom
      dark:border-white/[0.08] dark:bg-[#111214]/95"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all',
              isActive
                ? 'text-tbank-black dark:text-brand'
                : 'text-stone-400 dark:text-white/40',
            )
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive ? 'bg-brand text-tbank-black shadow-[0_2px_6px_rgba(255,221,45,0.4)] dark:shadow-glow-dark' : '',
                )}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
