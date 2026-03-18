'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Hash,
  Target,
  Calendar,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  ArrowUpRight,
  Trophy,
  Eye,
  History,
  X,
  Trash2,
} from 'lucide-react'
import { cn, formatNumber, getScoreBgColor } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileAnalysis {
  profileScore: number
  username: string
  fullName: string
  followers: number
  following: number
  posts: number
  engagementRate: number
  bioAnalysis: {
    score: number
    currentBio: string
    issues: string[]
    suggestedBio: string
    tips: string[]
  }
  contentStrategy: {
    score: number
    recommendedFormats: { format: string; percentage: number; reason: string }[]
    optimalPostingTimes: { day: string; time: string; reason: string }[]
    contentPillars: string[]
    tips: string[]
  }
  growthOpportunities: {
    title: string
    impact: string
    effort: string
    description: string
  }[]
  hashtagStrategy: {
    score: number
    recommended: { tag: string; posts: string; difficulty: string }[]
    avoidTags: string[]
    tips: string[]
  }
  competitorAnalysis: {
    username: string
    followers: string
    strength: string
    lessonToLearn: string
  }[]
  weeklyActionPlan: {
    day: string
    tasks: string[]
  }[]
  strengths: { title: string; description: string }[]
  blockers: { title: string; description: string }[]
}

interface DailyRecommendations {
  greeting: string
  todaysFocus: string
  recommendations: {
    category: string
    title: string
    description: string
    priority: string
  }[]
  quickWin: { title: string; description: string }
  inspirationPrompt: string
}

interface AnalysisHistoryItem {
  id: string
  username: string
  date: string
  profileScore: number
  analysis: ProfileAnalysis
}

// ---------------------------------------------------------------------------
// Circular Score Indicator
// ---------------------------------------------------------------------------

function CircularScore({
  score,
  size = 140,
  label,
}: {
  score: number
  size?: number
  label?: string
}) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color =
    score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-border"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold text-text-primary"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-text-secondary">/ 100</span>
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini Score Bar
// ---------------------------------------------------------------------------

function MiniScoreBar({ score, label }: { score: number; label: string }) {
  const color =
    score >= 70
      ? 'bg-success'
      : score >= 40
        ? 'bg-warning'
        : 'bg-danger'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary">{score}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Impact / Effort Badge
// ---------------------------------------------------------------------------

function ImpactBadge({ level }: { level: string }) {
  const variant =
    level === 'high' ? 'success' : level === 'medium' ? 'warning' : 'secondary'
  return (
    <Badge variant={variant} className="text-[10px] capitalize">
      {level}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const HISTORY_KEY = 'swell_profile_analysis_history'

function loadHistory(): AnalysisHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(history: AnalysisHistoryItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const [inputValue, setInputValue] = useState('')
  const [niche, setNiche] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDailyLoading, setIsDailyLoading] = useState(false)
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null)
  const [dailyRecs, setDailyRecs] = useState<DailyRecommendations | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [copiedBio, setCopiedBio] = useState(false)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  // ------ Handlers ------

  const cleanUsername = (raw: string) =>
    raw
      .trim()
      .replace(/^@/, '')
      .replace(/https?:\/\/(www\.)?instagram\.com\//, '')
      .replace(/\/$/, '')

  const handleAnalyze = useCallback(async () => {
    const username = cleanUsername(inputValue)
    if (!username) return

    setIsLoading(true)
    setAnalysis(null)
    setDailyRecs(null)
    setError(null)
    setIsSaved(false)
    setActiveTab('overview')

    try {
      const res = await fetch('/api/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, niche, target_audience: niche }),
      })

      if (!res.ok) throw new Error('Analysis failed')

      const data: ProfileAnalysis = await res.json()
      if ((data as unknown as { error: string }).error) throw new Error((data as unknown as { error: string }).error)
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [inputValue, niche])

  const handleDailyRecommendations = async () => {
    if (!analysis) return
    setIsDailyLoading(true)
    try {
      const res = await fetch('/api/ai/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: analysis.username,
          niche,
          action: 'daily_recommendations',
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data: DailyRecommendations = await res.json()
      setDailyRecs(data)
    } catch {
      // silent
    } finally {
      setIsDailyLoading(false)
    }
  }

  const handleSave = () => {
    if (!analysis) return
    const item: AnalysisHistoryItem = {
      id: Date.now().toString(36),
      username: analysis.username,
      date: new Date().toISOString(),
      profileScore: analysis.profileScore,
      analysis,
    }
    const updated = [item, ...history].slice(0, 20)
    setHistory(updated)
    saveHistory(updated)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleLoadFromHistory = (item: AnalysisHistoryItem) => {
    setAnalysis(item.analysis)
    setInputValue(item.username)
    setShowHistory(false)
    setActiveTab('overview')
  }

  const handleDeleteHistory = (id: string) => {
    const updated = history.filter((h) => h.id !== id)
    setHistory(updated)
    saveHistory(updated)
  }

  const handleCopyBio = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis.bioAnalysis.suggestedBio)
      setCopiedBio(true)
      setTimeout(() => setCopiedBio(false), 2000)
    }
  }

  const handleCopyHashtags = (tags: string[]) => {
    const text = tags.map((t) => `#${t}`).join(' ')
    navigator.clipboard.writeText(text)
    setCopiedTag('all')
    setTimeout(() => setCopiedTag(null), 2000)
  }

  // ------ Render ------

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Profile Analyzer
            </h1>
            <p className="text-text-secondary">
              Get a comprehensive AI-powered analysis of any Instagram profile
              with actionable growth strategies.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <History className="h-4 w-4" />
              History ({history.length})
            </button>
          )}
        </motion.div>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-semibold text-text-primary">
                  Past Analyses
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-border/50 px-4 py-3 last:border-0"
                  >
                    <button
                      onClick={() => handleLoadFromHistory(item)}
                      className="flex items-center gap-3 text-left hover:opacity-80"
                    >
                      <div
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold',
                          getScoreBgColor(item.profileScore)
                        )}
                      >
                        {item.profileScore}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          @{item.username}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {new Date(item.date).toLocaleDateString()} at{' '}
                          {new Date(item.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="rounded p-1 text-text-secondary hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex gap-3">
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
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Niche (optional)"
              className="w-48 rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              onClick={handleAnalyze}
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              Analyze
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            {...fadeInUp}
            className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
          >
            {error}
          </motion.div>
        )}

        {/* Loading Skeleton */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-6">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <div>
                  <p className="font-medium text-text-primary">
                    Analyzing @{cleanUsername(inputValue)}...
                  </p>
                  <p className="text-sm text-text-secondary">
                    Our AI is generating a comprehensive profile report. This
                    may take 15-30 seconds.
                  </p>
                </div>
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-6"
                >
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

        {/* Analysis Results */}
        <AnimatePresence>
          {analysis && !isLoading && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-6"
            >
              {/* ===== PROFILE HEADER ===== */}
              <motion.div
                variants={fadeInUp}
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                  {/* Score circle */}
                  <CircularScore
                    score={analysis.profileScore}
                    label="Profile Score"
                  />

                  {/* Profile info */}
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <h2 className="text-2xl font-bold text-text-primary">
                        @{analysis.username}
                      </h2>
                      <p className="text-text-secondary">
                        {analysis.fullName}
                      </p>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap justify-center gap-6 md:justify-start">
                      <div className="text-center">
                        <p className="text-lg font-bold text-text-primary">
                          {formatNumber(analysis.followers)}
                        </p>
                        <p className="text-xs text-text-secondary">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-text-primary">
                          {formatNumber(analysis.following)}
                        </p>
                        <p className="text-xs text-text-secondary">Following</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-text-primary">
                          {formatNumber(analysis.posts)}
                        </p>
                        <p className="text-xs text-text-secondary">Posts</p>
                      </div>
                      <div className="text-center">
                        <p
                          className={cn(
                            'text-lg font-bold',
                            analysis.engagementRate >= 3
                              ? 'text-success'
                              : analysis.engagementRate >= 1.5
                                ? 'text-warning'
                                : 'text-danger'
                          )}
                        >
                          {analysis.engagementRate}%
                        </p>
                        <p className="text-xs text-text-secondary">
                          Engagement
                        </p>
                      </div>
                    </div>

                    {/* Sub-scores */}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <MiniScoreBar
                        score={analysis.bioAnalysis.score}
                        label="Bio"
                      />
                      <MiniScoreBar
                        score={analysis.contentStrategy.score}
                        label="Content"
                      />
                      <MiniScoreBar
                        score={analysis.hashtagStrategy.score}
                        label="Hashtags"
                      />
                      <MiniScoreBar
                        score={Math.round(
                          (analysis.profileScore +
                            analysis.contentStrategy.score) /
                            2
                        )}
                        label="Growth"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row gap-2 md:flex-col">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                    >
                      <Save className="h-4 w-4" />
                      {isSaved ? 'Saved!' : 'Save'}
                    </button>
                    <button
                      onClick={handleAnalyze}
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Redo
                    </button>
                    <button
                      onClick={handleDailyRecommendations}
                      disabled={isDailyLoading}
                      className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/20"
                    >
                      {isDailyLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Daily Tips
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* ===== DAILY RECOMMENDATIONS (if loaded) ===== */}
              <AnimatePresence>
                {dailyRecs && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="rounded-xl border border-accent/30 bg-accent/5 p-6"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-accent" />
                      <h3 className="text-lg font-semibold text-text-primary">
                        Daily Recommendations
                      </h3>
                    </div>
                    <p className="mb-3 text-sm text-accent">
                      {dailyRecs.greeting}
                    </p>
                    <div className="mb-4 rounded-lg border border-accent/20 bg-background p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                        Today&apos;s Focus
                      </p>
                      <p className="mt-1 text-sm font-medium text-text-primary">
                        {dailyRecs.todaysFocus}
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {dailyRecs.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-border bg-surface p-3"
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <Badge
                              variant={
                                rec.priority === 'high'
                                  ? 'success'
                                  : rec.priority === 'medium'
                                    ? 'warning'
                                    : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {rec.category}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-text-primary">
                            {rec.title}
                          </p>
                          <p className="mt-1 text-xs text-text-secondary">
                            {rec.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    {dailyRecs.quickWin && (
                      <div className="mt-4 rounded-lg border border-warning/20 bg-warning/5 p-3">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-warning" />
                          <p className="text-sm font-medium text-text-primary">
                            Quick Win: {dailyRecs.quickWin.title}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-text-secondary">
                          {dailyRecs.quickWin.description}
                        </p>
                      </div>
                    )}
                    {dailyRecs.inspirationPrompt && (
                      <div className="mt-3 rounded-lg border border-border bg-background p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Content Inspiration
                        </p>
                        <p className="mt-1 text-sm italic text-text-primary">
                          &quot;{dailyRecs.inspirationPrompt}&quot;
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ===== TABBED SECTIONS ===== */}
              <motion.div variants={fadeInUp}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="w-full flex-wrap gap-1">
                    <TabsTrigger value="overview" className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="bio" className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Bio
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-1.5">
                      <Target className="h-3.5 w-3.5" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="growth" className="gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Growth
                    </TabsTrigger>
                    <TabsTrigger value="hashtags" className="gap-1.5">
                      <Hash className="h-3.5 w-3.5" />
                      Hashtags
                    </TabsTrigger>
                    <TabsTrigger value="competitors" className="gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      Competitors
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Weekly Plan
                    </TabsTrigger>
                  </TabsList>

                  {/* ---------- OVERVIEW TAB ---------- */}
                  <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Strengths */}
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Profile Strengths
                      </h3>
                      <div className="space-y-3">
                        {analysis.strengths.map((s, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-success/20 bg-success/5 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                              <div>
                                <p className="font-medium text-text-primary">
                                  {s.title}
                                </p>
                                <p className="mt-1 text-sm text-text-secondary">
                                  {s.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Blockers */}
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                        <AlertTriangle className="h-5 w-5 text-danger" />
                        Growth Blockers
                      </h3>
                      <div className="space-y-3">
                        {analysis.blockers.map((b, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-danger/20 bg-danger/5 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                              <div>
                                <p className="font-medium text-text-primary">
                                  {b.title}
                                </p>
                                <p className="mt-1 text-sm text-text-secondary">
                                  {b.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* ---------- BIO TAB ---------- */}
                  <TabsContent value="bio" className="mt-6 space-y-6">
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                          <FileText className="h-5 w-5 text-accent" />
                          Bio Analysis
                        </h3>
                        <div
                          className={cn(
                            'rounded-full px-3 py-1 text-sm font-semibold',
                            getScoreBgColor(analysis.bioAnalysis.score)
                          )}
                        >
                          {analysis.bioAnalysis.score}/100
                        </div>
                      </div>

                      {/* Current vs Suggested */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-border bg-background p-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Current Bio
                          </p>
                          <p className="text-sm text-text-primary">
                            {analysis.bioAnalysis.currentBio}
                          </p>
                        </div>
                        <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
                            Optimized Bio
                          </p>
                          <p className="text-sm text-text-primary">
                            {analysis.bioAnalysis.suggestedBio}
                          </p>
                          <button
                            onClick={handleCopyBio}
                            className="mt-3 flex items-center gap-1.5 rounded-md border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedBio ? 'Copied!' : 'Copy Bio'}
                          </button>
                        </div>
                      </div>

                      {/* Issues */}
                      {analysis.bioAnalysis.issues.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Issues Found
                          </p>
                          <div className="space-y-2">
                            {analysis.bioAnalysis.issues.map((issue, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                                <span className="text-text-secondary">
                                  {issue}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {analysis.bioAnalysis.tips.length > 0 && (
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Tips
                          </p>
                          <div className="space-y-2">
                            {analysis.bioAnalysis.tips.map((tip, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                                <span className="text-text-secondary">
                                  {tip}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* ---------- CONTENT STRATEGY TAB ---------- */}
                  <TabsContent value="content" className="mt-6 space-y-6">
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                          <Target className="h-5 w-5 text-accent" />
                          Content Strategy
                        </h3>
                        <div
                          className={cn(
                            'rounded-full px-3 py-1 text-sm font-semibold',
                            getScoreBgColor(analysis.contentStrategy.score)
                          )}
                        >
                          {analysis.contentStrategy.score}/100
                        </div>
                      </div>

                      {/* Content Pillars */}
                      <div className="mb-6">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Content Pillars
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.contentStrategy.contentPillars.map(
                            (pillar, i) => (
                              <Badge key={i} variant="outline">
                                {pillar}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      {/* Recommended Formats */}
                      <div className="mb-6">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Recommended Content Mix
                        </p>
                        <div className="space-y-3">
                          {analysis.contentStrategy.recommendedFormats.map(
                            (f, i) => (
                              <div key={i} className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-text-primary">
                                    {f.format}
                                  </span>
                                  <span className="text-accent">
                                    {f.percentage}%
                                  </span>
                                </div>
                                <Progress value={f.percentage} className="h-2" />
                                <p className="text-xs text-text-secondary">
                                  {f.reason}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Optimal Posting Times */}
                      <div className="mb-6">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Optimal Posting Times
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {analysis.contentStrategy.optimalPostingTimes.map(
                            (t, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                              >
                                <Clock className="h-4 w-4 shrink-0 text-accent" />
                                <div>
                                  <p className="text-sm font-medium text-text-primary">
                                    {t.day} at {t.time}
                                  </p>
                                  <p className="text-xs text-text-secondary">
                                    {t.reason}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Tips */}
                      <div>
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Pro Tips
                        </p>
                        <div className="space-y-2">
                          {analysis.contentStrategy.tips.map((tip, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 rounded-lg border border-accent/10 bg-accent/5 p-3 text-sm"
                            >
                              <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                              <span className="text-text-secondary">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ---------- GROWTH TAB ---------- */}
                  <TabsContent value="growth" className="mt-6 space-y-6">
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Growth Opportunities
                      </h3>
                      <div className="space-y-3">
                        {analysis.growthOpportunities.map((opp, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border bg-background p-4 transition-colors hover:border-accent/30"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <ArrowUpRight className="h-4 w-4 text-accent" />
                              <p className="font-medium text-text-primary">
                                {opp.title}
                              </p>
                              <div className="ml-auto flex gap-1.5">
                                <span className="text-[10px] text-text-secondary">
                                  Impact:
                                </span>
                                <ImpactBadge level={opp.impact} />
                                <span className="text-[10px] text-text-secondary">
                                  Effort:
                                </span>
                                <ImpactBadge level={opp.effort} />
                              </div>
                            </div>
                            <p className="text-sm text-text-secondary">
                              {opp.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* ---------- HASHTAGS TAB ---------- */}
                  <TabsContent value="hashtags" className="mt-6 space-y-6">
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
                          <Hash className="h-5 w-5 text-accent" />
                          Hashtag Strategy
                        </h3>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'rounded-full px-3 py-1 text-sm font-semibold',
                              getScoreBgColor(analysis.hashtagStrategy.score)
                            )}
                          >
                            {analysis.hashtagStrategy.score}/100
                          </div>
                          <button
                            onClick={() =>
                              handleCopyHashtags(
                                analysis.hashtagStrategy.recommended.map(
                                  (h) => h.tag
                                )
                              )
                            }
                            className="flex items-center gap-1.5 rounded-md border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            {copiedTag === 'all'
                              ? 'Copied!'
                              : 'Copy All'}
                          </button>
                        </div>
                      </div>

                      {/* Recommended Tags */}
                      <div className="mb-6">
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Recommended Hashtags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.hashtagStrategy.recommended.map((h, i) => {
                            const diffColor =
                              h.difficulty === 'easy'
                                ? 'border-success/30 bg-success/5 text-success'
                                : h.difficulty === 'medium'
                                  ? 'border-warning/30 bg-warning/5 text-warning'
                                  : 'border-danger/30 bg-danger/5 text-danger'
                            return (
                              <div
                                key={i}
                                className={cn(
                                  'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm',
                                  diffColor
                                )}
                              >
                                <span className="font-medium">#{h.tag}</span>
                                <span className="text-xs opacity-70">
                                  {h.posts}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Avoid Tags */}
                      {analysis.hashtagStrategy.avoidTags.length > 0 && (
                        <div className="mb-6">
                          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Tags to Avoid
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.hashtagStrategy.avoidTags.map((t, i) => (
                              <span
                                key={i}
                                className="rounded-full border border-danger/20 bg-danger/5 px-3 py-1 text-sm text-danger line-through"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      <div>
                        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Hashtag Tips
                        </p>
                        <div className="space-y-2">
                          {analysis.hashtagStrategy.tips.map((tip, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                              <span className="text-text-secondary">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ---------- COMPETITORS TAB ---------- */}
                  <TabsContent value="competitors" className="mt-6 space-y-6">
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                        <Trophy className="h-5 w-5 text-accent" />
                        Competitor Analysis
                      </h3>
                      <div className="space-y-3">
                        {analysis.competitorAnalysis.map((comp, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border bg-background p-4"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Instagram className="h-4 w-4 text-accent" />
                                <span className="font-semibold text-text-primary">
                                  @{comp.username}
                                </span>
                              </div>
                              <Badge variant="secondary">
                                {comp.followers} followers
                              </Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-success">
                                  Their Strength
                                </p>
                                <p className="mt-1 text-sm text-text-secondary">
                                  {comp.strength}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                                  Lesson to Learn
                                </p>
                                <p className="mt-1 text-sm text-text-secondary">
                                  {comp.lessonToLearn}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* ---------- WEEKLY PLAN TAB ---------- */}
                  <TabsContent value="plan" className="mt-6 space-y-6">
                    <div className="hover-card rounded-xl border border-border bg-surface p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                        <Calendar className="h-5 w-5 text-accent" />
                        7-Day Growth Action Plan
                      </h3>
                      <div className="space-y-3">
                        {analysis.weeklyActionPlan.map((day, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border bg-background p-4"
                          >
                            <div className="mb-2 flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                                {i + 1}
                              </div>
                              <p className="font-semibold text-text-primary">
                                {day.day}
                              </p>
                            </div>
                            <div className="ml-9 space-y-1.5">
                              {day.tasks.map((task, j) => (
                                <div
                                  key={j}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                                  <span className="text-text-secondary">
                                    {task}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
