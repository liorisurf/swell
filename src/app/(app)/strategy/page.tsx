'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Target, Calendar, TrendingUp, FlaskConical, Sparkles,
  Clock, Repeat, Users, Zap, ChevronRight, RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_STRATEGY = {
  niche_summary:
    'You operate at the intersection of surf culture, film photography, and slow travel. Your unique angle combines analog aesthetics with ocean lifestyle content, targeting a young, environmentally conscious audience who values authenticity over production value. This positions you in a growing micro-niche with high engagement potential and low competition.',
  content_formats: [
    'POV surf session Reels (raw, unedited energy)',
    'Film photography dump carousels (35mm grain aesthetic)',
    'Gear breakdown flat lays (minimalist kit)',
    '"Day in the life" documentary-style Reels',
    'Location reveal carousels (secret spots)',
    'Behind-the-scenes Stories of film developing',
    'Collaboration Reels with local shapers/artists',
  ],
  posting_schedule: {
    frequency: '5-7 times per week',
    best_days: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
    best_times: ['7:00 AM (dawn patrol energy)', '12:00 PM (lunch scroll)', '6:00 PM (evening wind-down)'],
    format_mix: '50% Reels, 25% Carousels, 15% Stories, 10% Static posts',
  },
  growth_levers: [
    'Engage daily with 20+ accounts in the surf/film photography crossover niche',
    'Create a signature hashtag for your community (#filmandfoam or similar)',
    'Collaborate monthly with 2-3 creators at similar follower count',
    'Cross-post top Reels to TikTok for discovery',
    'Build a curated guide/map carousel series for each location',
    'Join and actively contribute to surf photography communities',
    'Share user-generated content from your community weekly',
  ],
  experiments: [
    {
      title: 'Raw vs Edited Reels Test',
      hypothesis: 'Unedited, phone-shot surf clips will outperform polished edits in views and saves',
      success_metric: 'Compare avg views and save rate over 6 posts each',
      duration: '3 weeks',
    },
    {
      title: 'Carousel Length Optimization',
      hypothesis: '8-10 slide carousels with a storytelling arc will get 2x more saves than 4-5 slide sets',
      success_metric: 'Save rate comparison',
      duration: '2 weeks',
    },
    {
      title: 'Community Engagement Sprint',
      hypothesis: 'Spending 45 min/day engaging authentically in niche accounts will increase profile visits by 50%',
      success_metric: 'Profile visit increase + new follower quality',
      duration: '2 weeks',
    },
  ],
  generated_at: '2024-03-15',
  expires_at: '2024-04-14',
}

export default function StrategyPage() {
  const [strategy] = useState(DEMO_STRATEGY)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target className="h-6 w-6 text-accent" />
            Growth Strategy
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your personalized 30-day growth plan — updated automatically based on results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">
            Expires {new Date(strategy.expires_at).toLocaleDateString()}
          </span>
          <button className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Niche Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hover-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Your Niche</h2>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{strategy.niche_summary}</p>
      </motion.div>

      {/* Content Formats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hover-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-warning" />
          <h2 className="text-lg font-semibold text-text-primary">Best Content Formats</h2>
        </div>
        <div className="space-y-2">
          {strategy.content_formats.map((format, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-background/50 border border-border/50 px-4 py-2.5">
              <ChevronRight className="h-4 w-4 text-accent flex-shrink-0" />
              <span className="text-sm text-text-primary">{format}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Posting Schedule */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="hover-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold text-text-primary">Posting Schedule</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Frequency</span>
            <p className="text-sm text-text-primary mt-1">{strategy.posting_schedule.frequency}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Format Mix</span>
            <p className="text-sm text-text-primary mt-1">{strategy.posting_schedule.format_mix}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Best Days</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {strategy.posting_schedule.best_days.map((day) => (
                <span key={day} className="text-xs rounded-full bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5">
                  {day}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Best Times</span>
            <div className="space-y-1 mt-1">
              {strategy.posting_schedule.best_times.map((time) => (
                <div key={time} className="flex items-center gap-2 text-sm text-text-primary">
                  <Clock className="h-3.5 w-3.5 text-text-secondary" />
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Growth Levers */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="hover-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-success" />
          <h2 className="text-lg font-semibold text-text-primary">Growth Levers</h2>
        </div>
        <div className="space-y-2">
          {strategy.growth_levers.map((lever, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg bg-background/50 border border-border/50 px-4 py-2.5">
              <span className="text-xs font-bold text-accent mt-0.5">{i + 1}</span>
              <span className="text-sm text-text-primary">{lever}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Experiments */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="hover-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-text-primary">Experiments to Run</h2>
        </div>
        <div className="space-y-4">
          {strategy.experiments.map((exp, i) => (
            <div key={i} className="rounded-lg bg-background/50 border border-border/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-text-primary">{exp.title}</h3>
                <span className="text-xs text-text-secondary">{exp.duration}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-text-secondary min-w-[80px]">Hypothesis:</span>
                  <span className="text-xs text-text-primary">{exp.hypothesis}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-text-secondary min-w-[80px]">Measure:</span>
                  <span className="text-xs text-text-primary">{exp.success_metric}</span>
                </div>
              </div>
              <button className="mt-3 text-xs text-accent hover:underline">
                Start this experiment →
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
