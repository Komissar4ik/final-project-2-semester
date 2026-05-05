import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User, Users, Newspaper, Heart, MessageCircle,
  ArrowRight, Sparkles, BadgeCheck, TrendingUp,
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import FeatureCard from '../components/FeatureCard';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import ThemeToggle from '../components/ThemeToggle';

const FEATURES = [
  { icon: <User size={22} />, title: 'Rich Profiles', description: 'Express yourself with a fully customizable profile, bio, links, and cover photo.' },
  { icon: <Newspaper size={22} />, title: 'Smart Feed', description: 'Curated posts from people you follow — clean, chronological, no algorithms.' },
  { icon: <Users size={22} />, title: 'Connections', description: 'Follow creators and thinkers. Build a network that actually inspires you.' },
  { icon: <Heart size={22} />, title: 'Reactions', description: 'Like posts to show appreciation and surface what resonates most.' },
  { icon: <MessageCircle size={22} />, title: 'Conversations', description: 'Threaded comments make it easy to dive deep into any discussion.' },
  { icon: <TrendingUp size={22} />, title: 'Trending', description: "Discover today's most popular topics and hashtags in one click." },
].map((f) => ({
  ...f,
  gradient: 'bg-gradient-to-br from-brand/30 to-brand-light/10',
}));

function PreviewPost({ avatar, name, time, text, likes, delay }: {
  avatar: string; name: string; time: string; text: string; likes: number; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ x: -4 }}
      className="rounded-2xl border border-tbank-border bg-white/95 p-4 w-72 shadow-card
        dark:border-white/[0.08] dark:bg-white/[0.05] dark:shadow-none"
    >
      <div className="flex items-center gap-3 mb-2">
        <img src={avatar} alt={name} className="w-8 h-8 rounded-full" />
        <div>
          <p className="text-sm font-semibold text-tbank-black dark:text-white">{name}</p>
          <p className="text-xs text-stone-500 dark:text-white/35">{time}</p>
        </div>
        <BadgeCheck size={14} className="ml-auto text-brand" />
      </div>
      <p className="text-xs text-stone-600 dark:text-white/65 leading-relaxed mb-3">{text}</p>
      <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-white/30">
        <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400">
          <Heart size={11} className="fill-rose-500 dark:fill-rose-400" /> {likes}
        </span>
        <span className="flex items-center gap-1"><MessageCircle size={11} /> 24</span>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans overflow-hidden text-tbank-black dark:text-white">
      <AnimatedBackground />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4
          border-b border-tbank-border/60 bg-white/90 backdrop-blur-sm
          dark:border-white/[0.07] dark:bg-[#111214]/90"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-glow dark:shadow-glow-dark">
            <span className="text-tbank-black font-bold text-lg font-display leading-none">T</span>
          </div>
          <span className="text-lg font-bold text-tbank-black dark:text-white font-display tracking-tight">Nexus</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/auth"><Button variant="primary" size="sm" icon={<Sparkles size={13} />}>Get started</Button></Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-dark bg-brand text-tbank-black text-xs font-semibold mb-6 shadow-[0_0_20px_rgba(255,221,45,0.15)]"
            >
              <Sparkles size={12} className="shrink-0 opacity-90" aria-hidden />
              A new era of social networking
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-tbank-black dark:text-white font-display leading-[1.08] tracking-tight mb-6"
            >
              Connect.{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-[#F5C800] to-brand bg-clip-text text-transparent">
                  Create.
                </span>
                {/* Yellow underline accent */}
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-brand/30 -skew-y-1 rounded dark:bg-brand/20" />
              </span>{' '}
              Inspire.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-stone-600 dark:text-white/55 leading-relaxed mb-8 max-w-md"
            >
              Nexus is a premium social network where ideas flow freely. Follow creators, share
              your story, and build meaningful connections.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/auth">
                <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>Start for free</Button>
              </Link>
              <Link to="/app/feed">
                <Button variant="secondary" size="lg">Explore feed</Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 mt-8"
            >
              <div className="flex -space-x-2">
                {['alex', 'nova', 'kai', 'luna'].map((seed) => (
                  <img
                    key={seed}
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`}
                    alt={seed}
                    className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-[#111214]"
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 dark:text-white/40">
                <span className="font-semibold text-tbank-black dark:text-white">12,400+</span> creators already joined
              </p>
            </motion.div>
          </div>

          <div className="hidden lg:flex flex-col gap-4 items-end">
            <PreviewPost avatar="https://api.dicebear.com/9.x/avataaars/svg?seed=nova&backgroundColor=ffd5dc" name="Nova Chen" time="2m ago" text="Just shipped a stunning new design system using CSS variables only. No JS needed — pure power 🎨" likes={1842} delay={0.3} />
            <PreviewPost avatar="https://api.dicebear.com/9.x/avataaars/svg?seed=orion&backgroundColor=ffdfbf" name="Orion Park" time="15m ago" text="After 6 months of research: LLMs at scale exhibit emergent reasoning beyond pattern matching." likes={5231} delay={0.45} />
            <PreviewPost avatar="https://api.dicebear.com/9.x/avataaars/svg?seed=alex&backgroundColor=b6e3f4" name="Alex Cosmos" time="1h ago" text="TypeScript found 87 silent bugs in a 40k line JS codebase. Not optional anymore 🔥" likes={3109} delay={0.6} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-block px-3 py-1 rounded-full bg-brand/20 border border-brand/40 text-tbank-black text-xs font-semibold mb-3 uppercase tracking-wider">
              Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-tbank-black dark:text-white font-display mb-4">
              Built for creators
            </h2>
            <p className="text-stone-600 dark:text-white/45 max-w-md mx-auto">
              Every feature is designed with care to help you express yourself and connect with others.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <FeatureCard {...f} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <GlassCard
            glow
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center mx-auto mb-6 shadow-glow dark:shadow-glow-dark">
              <span className="text-tbank-black font-bold text-2xl font-display leading-none">T</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-tbank-black dark:text-white font-display mb-4">
              Ready to join Nexus?
            </h2>
            <p className="text-stone-600 dark:text-white/45 mb-8 leading-relaxed">
              Sign up in seconds and start connecting with an amazing community of creators, builders, and thinkers.
            </p>
            <Link to="/auth">
              <Button variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                Create free account
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
