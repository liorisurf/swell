'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Users,
  FileText,
  Clock,
  Copy,
  RotateCcw,
  Save,
  Loader2,
  Instagram,
} from 'lucide-react'
import { cn, formatNumber, getScoreBgColor, formatPercentage } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
}

interface ProfileReport {
  username: string
  fullName: string
  followers: number
  following: number
  posts: number
  engagementRate: number
  strengths: { title: string; description: string }[]
  blockers: { title: string; description: string }[]
  opportunities: { title: string; description: string }[]
  audienceAlignment: { matchPercentage: number; description: string }
  bioOptimization: { current: string; suggested: string }
  postingStrategy: {
    cadence: string
    formats: string[]
    bestTimes: string[]
    summary: string
  }
}

const demoReport: ProfileReport = {
  username: 'creativestudio.co',
  fullName: 'Creative Studio',
  followers: 24800,
  following: 1230,
  posts: 487,
  engagementRate: 3.8,
  strengths: [
    {
      title: 'Strong Visual Identity',
      description:
        'Consistent color palette and editing style across posts. Brand recognition is above average for accounts this size.',
    },
    {
      title: 'High Save Rate',
      description:
        'Your educational carousels are saved 4x more than industry average, indicating strong value delivery.',
    },
    {
      title: 'Active Community',
      description:
        'Reply rate to comments is 89%, building loyalty. Average comment sentiment is 92% positive.',
    },
  ],
  blockers: [
    {
      title: 'Inconsistent Posting Schedule',
      description:
        'Gaps of 5-7 days between posts detected in the last 90 days. Algorithm favors consistent cadence.',
    },
    {
      title: 'Low Reels Adoption',
      description:
        'Only 12% of content is Reels. Accounts in your niche using 40%+ Reels see 2.3x more reach.',
    },
    {
      title: 'Hashtag Strategy Needs Work',
      description:
        'Using overly broad hashtags with 10M+ posts. Mid-range hashtags (50K-500K) would improve discoverability.',
    },
  ],
  opportunities: [
    {
      title: 'Carousel Tutorial Series',
      description:
        'Your how-to carousels get 3.2x engagement. A weekly series could drive consistent growth.',
    },
    {
      title: 'Collaboration Potential',
      description:
        '8 accounts in your niche (10K-50K) share overlapping audiences. Strategic collabs could unlock 5K+ followers.',
    },
    {
      title: 'Behind-the-Scenes Content',
      description:
        'Process content in your niche gets 40% higher shares. Showing your workflow could boost virality.',
    },
  ],
  audienceAlignment: {
    matchPercentage: 78,
    description:
      'Your audience is 78% aligned with your target demographic. Primary audience: 25-34 year old creatives in urban areas. 62% female, 35% male, 3% non-binary. Top locations: Los Angeles, New York, London, Berlin. Main interests: design, photography, entrepreneurship, digital marketing.',
  },
  bioOptimization: {
    current:
      'Creative Studio | We make cool stuff | DM for collabs | Link in bio',
    suggested:
      'Design & Branding Studio | Helping startups stand out visually | Free brand audit in bio | Weekly design tips',
  },
  postingStrategy: {
    cadence: '5 posts per week: 2 Reels, 2 Carousels, 1 Static',
    formats: ['Reels (short tutorials)', 'Carousels (step-by-step guides)', 'Static (portfolio pieces)', 'Stories (daily behind-the-scenes)'],
    bestTimes: ['Tuesday 9:00 AM', 'Wednesday 12:30 PM', 'Thursday 6:00 PM', 'Saturday 10:00 AM'],
    summary:
      'Focus on educational Reels and carousels during peak engagement windows. Use Stories for daily touchpoints and static posts to showcase portfolio work. Maintain a minimum 5-post weekly cadence for algorithm consistency.',
  },
}

export default function ProfilePage() {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState<ProfileReport | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [copiedBio, setCopiedBio] = useState(false)

  const handleAnalyze = () => {
    if (!inputValue.trim()) return
    setIsLoading(true)
    setReport(null)
    setIsSaved(false)

    setTimeout(() => {
      setReport({ ...demoReport, username: inputValue.replace(/^@/, '').replace(/https?:\/\/(www\.)?instagram\.com\//, '') })
      setIsLoading(false)
    }, 2500)
  }

  const handleReanalyze = () => {
    setIsLoading(true)
    setReport(null)
    setIsSaved(false)

    setTimeout(() => {
      setReport(demoReport)
      setIsLoading(false)
    }, 2500)
  }

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleCopyBio = () => {
    if (report) {
      navigator.clipboard.writeText(report.bioOptimization.suggested)
      setCopiedBio(true)
      setTimeout(() => setCopiedBio(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">Profile Analyzer</h1>
          <p className="text-text-secondary">
            Enter an Instagram username or URL to get a full growth analysis.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="flex gap-3">
          <div className="relative flex-1">
            <Instagram className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="@username or instagram.com/username"
              className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-4 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            Analyze
          </button>
        </motion.div>

        {/* Loading skeleton */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-surface p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-5 w-1/3 rounded bg-border" />
                    <div className="h-4 w-full rounded bg-border/60" />
                    <div className="h-4 w-2/3 rounded bg-border/60" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report */}
        <AnimatePresence>
          {report && !isLoading && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              {/* Profile summary bar */}
              <motion.div
                variants={fadeInUp}
                className="hover-card flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-6"
              >
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">@{report.username}</h2>
                  <p className="text-text-secondary">{report.fullName}</p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-text-primary">{formatNumber(report.followers)}</p>
                    <p className="text-text-secondary">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-text-primary">{formatNumber(report.following)}</p>
                    <p className="text-text-secondary">Following</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-text-primary">{formatNumber(report.posts)}</p>
                    <p className="text-text-secondary">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className={cn('font-semibold', report.engagementRate >= 3 ? 'text-success' : 'text-warning')}>
                      {report.engagementRate}%
                    </p>
                    <p className="text-text-secondary">Eng. Rate</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    <Save className="h-4 w-4" />
                    {isSaved ? 'Saved!' : 'Save Report'}
                  </button>
                  <button
                    onClick={handleReanalyze}
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reanalyze
                  </button>
                </div>
              </motion.div>

              {/* 1. Profile Strengths */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Profile Strengths
                </h3>
                <div className="space-y-3">
                  {report.strengths.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-success/20 bg-success/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <div>
                          <p className="font-medium text-text-primary">{item.title}</p>
                          <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 2. Growth Blockers */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                  Growth Blockers
                </h3>
                <div className="space-y-3">
                  {report.blockers.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-danger/20 bg-danger/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                        <div>
                          <p className="font-medium text-text-primary">{item.title}</p>
                          <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 3. Content Opportunities */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  Content Opportunities
                </h3>
                <div className="space-y-3">
                  {report.opportunities.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-warning/20 bg-warning/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <div>
                          <p className="font-medium text-text-primary">{item.title}</p>
                          <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 4. Audience Alignment */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <Users className="h-5 w-5 text-accent" />
                  Audience Alignment
                </h3>
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-lg font-bold',
                      getScoreBgColor(report.audienceAlignment.matchPercentage)
                    )}
                  >
                    {report.audienceAlignment.matchPercentage}%
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {report.audienceAlignment.description}
                  </p>
                </div>
              </motion.div>

              {/* 5. Bio Optimization */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <FileText className="h-5 w-5 text-accent" />
                  Bio Optimization
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Current Bio
                    </p>
                    <p className="text-sm text-text-primary">{report.bioOptimization.current}</p>
                  </div>
                  <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
                      Suggested Bio
                    </p>
                    <p className="text-sm text-text-primary">{report.bioOptimization.suggested}</p>
                    <button
                      onClick={handleCopyBio}
                      className="mt-3 flex items-center gap-1.5 rounded-md border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedBio ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 6. Posting Strategy */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <Clock className="h-5 w-5 text-accent" />
                  Posting Strategy
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Recommended Cadence
                    </p>
                    <p className="mt-1 text-sm text-text-primary">{report.postingStrategy.cadence}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Content Formats
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.postingStrategy.formats.map((format, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-primary"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      Best Times to Post
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {report.postingStrategy.bestTimes.map((time, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-sm leading-relaxed text-text-secondary">
                      {report.postingStrategy.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
