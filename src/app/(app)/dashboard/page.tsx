'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles, TrendingUp, Calendar, Clock, ArrowUpRight,
  Users, Eye, Heart, MessageCircle, ChevronRight,
  Flame, Lightbulb, Target, FlaskConical,
} from 'lucide-react'
import { cn, formatNumber, getScoreBgColor } from '@/lib/utils'

// Demo data for the dashboard
const DEMO_STATS = {
  followers: 12847,
  followersChange: 3.2,
  reach: 48200,
  reachChange: 12.5,
  engagement: 4.7,
  engagementChange: -0.3,
  profileVisits: 1240,
  profileVisitsChange: 8.1,
}

const DEMO_COPILOT = [
  { title: 'Engage with @surfculture.co', reason: 'High engagement, overlapping audience', type: 'account_visit' },
  { title: 'Comment on trending reel about longboard fins', reason: 'Trending topic in your niche', type: 'post_engage' },
  { title: 'Post a "5 tips" carousel about board waxing', reason: 'Educational carousels are performing well', type: 'content_idea' },
]

const DEMO_TREND = {
  topic: 'Film photography comeback',
  momentum: 87,
  growth: '+42%',
  source: 'Cross-platform',
}

const DEMO_CONTENT_IDEA = {
  title: '"Day in the life" reel at your local break',
  format: 'Reel',
  score: 91,
  reason: 'POV content is trending +38% in surf niche this week',
}

const DEMO_CALENDAR = [
  { title: 'Board quiver carousel', time: '10:00 AM', format: 'Carousel' },
  { title: 'Sunset session reel', time: '6:00 PM', format: 'Reel' },
]

const DEMO_EXPERIMENTS = [
  { title: 'Hook variation test', status: 'running', result: '2.3x more views with question hooks' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link
          href="/copilot"
          className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Open Daily Copilot
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Followers"
          value={formatNumber(DEMO_STATS.followers)}
          change={DEMO_STATS.followersChange}
        />
        <StatCard
          icon={Eye}
          label="Reach (7d)"
          value={formatNumber(DEMO_STATS.reach)}
          change={DEMO_STATS.reachChange}
        />
        <StatCard
          icon={Heart}
          label="Engagement"
          value={`${DEMO_STATS.engagement}%`}
          change={DEMO_STATS.engagementChange}
        />
        <StatCard
          icon={MessageCircle}
          label="Profile Visits (7d)"
          value={formatNumber(DEMO_STATS.profileVisits)}
          change={DEMO_STATS.profileVisitsChange}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Copilot Preview */}
        <div className="lg:col-span-2 hover-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-text-primary">Daily Copilot</h2>
            </div>
            <Link href="/copilot" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_COPILOT.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 rounded-lg bg-background/50 border border-border/50 p-3 group hover:border-accent/30 transition-colors"
              >
                <div className="mt-0.5">
                  {item.type === 'account_visit' && <Users className="h-4 w-4 text-accent" />}
                  {item.type === 'post_engage' && <Heart className="h-4 w-4 text-pink-400" />}
                  {item.type === 'content_idea' && <Lightbulb className="h-4 w-4 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{item.reason}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 text-xs text-accent hover:underline transition-opacity">
                  Done
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Best Time to Post */}
          <div className="hover-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-text-primary">Best Time to Post</h2>
            </div>
            <div className="text-3xl font-bold gradient-text mb-1">6:00 PM</div>
            <p className="text-xs text-text-secondary">Your audience is most active between 5-7 PM today</p>
          </div>

          {/* Top Content Idea */}
          <div className="hover-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h2 className="font-semibold text-text-primary">Top Content Idea</h2>
            </div>
            <p className="text-sm text-text-primary font-medium mb-2">{DEMO_CONTENT_IDEA.title}</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs rounded-full bg-surface border border-border px-2 py-0.5">{DEMO_CONTENT_IDEA.format}</span>
              <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', getScoreBgColor(DEMO_CONTENT_IDEA.score))}>
                Score: {DEMO_CONTENT_IDEA.score}
              </span>
            </div>
            <p className="text-xs text-text-secondary">{DEMO_CONTENT_IDEA.reason}</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 text-xs rounded-lg bg-accent/10 text-accent py-1.5 hover:bg-accent/20 transition-colors">
                Save
              </button>
              <button className="flex-1 text-xs rounded-lg bg-accent text-white py-1.5 hover:bg-accent-hover transition-colors">
                Use
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Radar */}
        <div className="hover-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <h2 className="font-semibold text-text-primary">Top Trend</h2>
            </div>
            <Link href="/trends" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-sm font-medium text-text-primary mb-2">{DEMO_TREND.topic}</p>
          <div className="flex items-center gap-3">
            <span className={cn('text-xs rounded-full px-2 py-0.5 font-medium', getScoreBgColor(DEMO_TREND.momentum))}>
              Momentum: {DEMO_TREND.momentum}
            </span>
            <span className="text-xs text-success font-medium">{DEMO_TREND.growth}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 text-xs rounded-lg bg-accent/10 text-accent py-1.5 hover:bg-accent/20 transition-colors">
              Save
            </button>
            <button className="flex-1 text-xs rounded-lg border border-border text-text-secondary py-1.5 hover:text-text-primary transition-colors">
              Add to Calendar
            </button>
          </div>
        </div>

        {/* Upcoming Calendar */}
        <div className="hover-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-text-primary">Today&apos;s Calendar</h2>
            </div>
            <Link href="/content" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_CALENDAR.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs text-text-secondary font-mono w-16">{item.time}</div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{item.title}</p>
                  <span className="text-xs text-text-secondary">{item.format}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experiment */}
        <div className="hover-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-purple-400" />
              <h2 className="font-semibold text-text-primary">Active Experiment</h2>
            </div>
            <Link href="/experiments" className="text-xs text-accent hover:underline flex items-center gap-1">
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {DEMO_EXPERIMENTS.map((exp, i) => (
            <div key={i}>
              <p className="text-sm font-medium text-text-primary mb-1">{exp.title}</p>
              <span className="inline-flex items-center rounded-full bg-warning/10 text-warning text-xs px-2 py-0.5 mb-2">
                Running
              </span>
              <p className="text-xs text-text-secondary">{exp.result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: React.ElementType
  label: string
  value: string
  change: number
}) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hover-card p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-text-secondary" />
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className={cn('flex items-center gap-1 mt-1 text-xs font-medium', isPositive ? 'text-success' : 'text-danger')}>
        <ArrowUpRight className={cn('h-3 w-3', !isPositive && 'rotate-180')} />
        {Math.abs(change)}% this week
      </div>
    </motion.div>
  )
}
