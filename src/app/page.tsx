'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Waves, ArrowRight, Shield, Sparkles, TrendingUp, Search, BarChart3, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-7 w-7 text-accent" />
            <span className="text-xl font-bold gradient-text">SWELL</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="safety-badge mx-auto mb-8">
            <Shield className="h-3.5 w-3.5" />
            100% manual actions — your account stays safe
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Your Instagram
            <br />
            <span className="gradient-text">Growth Copilot</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            AI-powered research, content intelligence, and daily action recommendations.
            For any niche. Any creator. Any brand. Grow smarter, not harder.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-hover transition-all shadow-lg shadow-accent/25"
            >
              Start Growing Free <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Sparkles,
              title: 'Daily Copilot',
              desc: 'Fresh daily actions — accounts to engage, content ideas, and growth moves personalized to your niche.',
            },
            {
              icon: Search,
              title: 'Smart Discovery',
              desc: 'Find the right accounts, hashtags, and communities. AI scores every result for relevance and opportunity.',
            },
            {
              icon: TrendingUp,
              title: 'Trend Radar',
              desc: 'Detect emerging trends across Instagram, TikTok, YouTube, Reddit, and Pinterest before they peak.',
            },
            {
              icon: Zap,
              title: 'Content Lab',
              desc: 'Generate hooks, captions, hashtag sets, and content ideas matched to your style and audience.',
            },
            {
              icon: BarChart3,
              title: 'Growth Analytics',
              desc: 'Track what works. Interactive charts, plain-English insights, and weekly performance summaries.',
            },
            {
              icon: Shield,
              title: 'Always Safe',
              desc: 'No automation. No bots. No login required. Every action is taken by you. Your account stays safe.',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="hover-card p-6 group"
            >
              <feature.icon className="h-10 w-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Any Niche Section */}
      <section className="border-t border-border/50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Built for <span className="gradient-text">your world</span>
          </h2>
          <p className="text-text-secondary mb-10">
            Surf, fashion, food, gaming, fitness, art, travel — define your niche and SWELL learns it.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Surf', 'Photography', 'Fitness', 'Food', 'Travel', 'Music',
              'Fashion', 'Art', 'Gaming', 'Tech', 'Sustainability', 'Coffee',
              'Skate', 'Yoga', 'Film', 'Design', 'Pets', 'Streetwear',
            ].map((niche) => (
              <span
                key={niche}
                className="rounded-full border border-border bg-surface/50 px-4 py-1.5 text-sm text-text-secondary"
              >
                {niche}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-accent" />
            <span className="text-sm font-semibold gradient-text">SWELL</span>
          </div>
          <p className="text-xs text-text-secondary">
            Instagram Growth Copilot. All actions are manual. Your account is always safe.
          </p>
        </div>
      </footer>
    </div>
  )
}
