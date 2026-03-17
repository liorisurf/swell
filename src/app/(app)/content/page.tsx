'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, Anchor, Hash, Calendar,
  Sparkles, Copy, Check, ThumbsUp, ThumbsDown,
  Bookmark, Play, SkipForward, Filter,
  Plus, Clock, ChevronDown, RefreshCw,
  Film, Image, FileText, CircleDot,
} from 'lucide-react'
import { cn, getScoreBgColor } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────────────────

type ContentFormat = 'Reel' | 'Carousel' | 'Post' | 'Story'
type Tab = 'ideas' | 'hooks' | 'hashtags' | 'calendar'
type CalendarStatus = 'planned' | 'creating' | 'ready' | 'published'

interface ContentIdea {
  id: string
  title: string
  format: ContentFormat
  description: string
  score: number
  hashtags: string[]
  feedback?: 'saved' | 'used' | 'skipped'
}

interface Hook {
  id: string
  text: string
  formats: ContentFormat[]
  example: string
  copied?: boolean
}

interface Hashtag {
  tag: string
  posts: number
}

interface HashtagSet {
  primary: Hashtag[]
  growth: Hashtag[]
  community: Hashtag[]
}

interface CalendarItem {
  id: string
  title: string
  time: string
  format: ContentFormat
  status: CalendarStatus
  day: number // 0=Mon, 6=Sun
}

// ─── Demo Data ──────────────────────────────────────────────────────────────

const DEMO_IDEAS: ContentIdea[] = [
  {
    id: '1',
    title: '"Day in the life" at your local break',
    format: 'Reel',
    description: 'POV content showing your morning surf routine from wakeup to catching your first wave. Authentic, relatable, trending format.',
    score: 91,
    hashtags: ['#surflife', '#morningsession', '#pov', '#surfing'],
  },
  {
    id: '2',
    title: 'Board quiver breakdown carousel',
    format: 'Carousel',
    description: 'Show your top 5 boards with specs, conditions they suit, and personal ratings. Educational content performs well.',
    score: 84,
    hashtags: ['#surfboards', '#quiver', '#surfgear', '#boardreview'],
  },
  {
    id: '3',
    title: 'Wax application technique tips',
    format: 'Reel',
    description: 'Quick tutorial on proper wax technique — base coat, top coat, temperature selection. High save rate content.',
    score: 78,
    hashtags: ['#surftips', '#surfwax', '#tutorial', '#learntosurf'],
  },
  {
    id: '4',
    title: 'Sunset session photo dump',
    format: 'Post',
    description: 'Golden hour shots from this week. Photo dumps get 2.3x more engagement than single photos in your niche.',
    score: 72,
    hashtags: ['#goldenhour', '#sunsetsession', '#surfphotography'],
  },
  {
    id: '5',
    title: 'Behind the scenes: shaping a board',
    format: 'Story',
    description: 'Quick BTS story series showing the board shaping process at a local shaper. Great for community engagement.',
    score: 65,
    hashtags: ['#boardshaping', '#bts', '#surfcraft', '#handmade'],
  },
  {
    id: '6',
    title: '"What I eat in a day" as a surfer',
    format: 'Reel',
    description: 'Nutrition-focused content crossing over to fitness niche. Expands reach beyond core surf audience.',
    score: 88,
    hashtags: ['#surferlife', '#whatieatinaday', '#surfnutrition'],
  },
  {
    id: '7',
    title: 'Beginner mistakes to avoid carousel',
    format: 'Carousel',
    description: '7-slide carousel of common beginner mistakes. Educational carousels have highest save rate in your content history.',
    score: 93,
    hashtags: ['#surfbeginner', '#surftips', '#learntosurff'],
  },
  {
    id: '8',
    title: 'Storytime: worst wipeout ever',
    format: 'Story',
    description: 'Engaging storytelling format with text overlays. Stories with personal narratives see 40% more taps forward.',
    score: 44,
    hashtags: ['#wipeout', '#surfstory', '#storytime'],
  },
]

const DEMO_HOOKS: Hook[] = [
  {
    id: 'h1',
    text: 'Stop scrolling if you\'ve ever wondered why your pop-up is so slow...',
    formats: ['Reel'],
    example: 'Lead into a 3-step technique breakdown for faster pop-ups',
  },
  {
    id: 'h2',
    text: 'I spent $3,000 on surfboards so you don\'t have to.',
    formats: ['Reel', 'Carousel'],
    example: 'Transition into a board comparison or "best boards under $500" list',
  },
  {
    id: 'h3',
    text: 'The one thing every pro surfer does that beginners skip...',
    formats: ['Reel', 'Post'],
    example: 'Reveal a technique like reading the wave face before paddling',
  },
  {
    id: 'h4',
    text: 'POV: You finally nail your first barrel 🤙',
    formats: ['Reel', 'Story'],
    example: 'Use actual footage or slow-motion barrel riding clip',
  },
  {
    id: 'h5',
    text: 'Nobody talks about this side of surfing...',
    formats: ['Reel', 'Carousel'],
    example: 'Cover the mental health, patience, or community aspects',
  },
  {
    id: 'h6',
    text: 'Save this for your next surf trip ✈️🏄',
    formats: ['Carousel', 'Post'],
    example: 'Packing checklist, destination guide, or travel tips carousel',
  },
]

const DEMO_HASHTAG_SETS: HashtagSet = {
  primary: [
    { tag: '#surfing', posts: 42800000 },
    { tag: '#surfer', posts: 18200000 },
    { tag: '#surflife', posts: 12400000 },
    { tag: '#surfphotography', posts: 8900000 },
    { tag: '#surfboard', posts: 6700000 },
    { tag: '#surfculture', posts: 3200000 },
    { tag: '#surftrip', posts: 5100000 },
  ],
  growth: [
    { tag: '#oceanlife', posts: 9400000 },
    { tag: '#beachvibes', posts: 15600000 },
    { tag: '#watersport', posts: 4300000 },
    { tag: '#outdooradventure', posts: 7800000 },
    { tag: '#saltlife', posts: 6100000 },
    { tag: '#exploremore', posts: 22100000 },
  ],
  community: [
    { tag: '#surfcommunity', posts: 1800000 },
    { tag: '#localsonly', posts: 890000 },
    { tag: '#surftribe', posts: 420000 },
    { tag: '#kooksofinstagram', posts: 210000 },
    { tag: '#surfbuddies', posts: 340000 },
    { tag: '#lineupvibes', posts: 150000 },
  ],
}

function getWeekDates(): Date[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1))
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates.push(d)
  }
  return dates
}

const WEEK_DATES = getWeekDates()
const TODAY_INDEX = (() => {
  const d = new Date().getDay()
  return d === 0 ? 6 : d - 1
})()

const DEMO_CALENDAR: CalendarItem[] = [
  { id: 'c1', title: 'Board quiver carousel', time: '10:00 AM', format: 'Carousel', status: 'ready', day: 0 },
  { id: 'c2', title: 'Sunset session reel', time: '6:00 PM', format: 'Reel', status: 'planned', day: 0 },
  { id: 'c3', title: 'Surf tips story series', time: '12:00 PM', format: 'Story', status: 'published', day: 1 },
  { id: 'c4', title: 'Wax tutorial reel', time: '9:00 AM', format: 'Reel', status: 'creating', day: 2 },
  { id: 'c5', title: '"What I eat" reel', time: '5:00 PM', format: 'Reel', status: 'planned', day: 3 },
  { id: 'c6', title: 'Photo dump post', time: '11:00 AM', format: 'Post', status: 'planned', day: 3 },
  { id: 'c7', title: 'Beginner mistakes carousel', time: '10:00 AM', format: 'Carousel', status: 'planned', day: 4 },
  { id: 'c8', title: 'BTS shaping story', time: '3:00 PM', format: 'Story', status: 'planned', day: 5 },
  { id: 'c9', title: 'Wipeout storytime', time: '7:00 PM', format: 'Reel', status: 'planned', day: 6 },
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Helpers ────────────────────────────────────────────────────────────────

const FORMAT_ICONS: Record<ContentFormat, React.ElementType> = {
  Reel: Film,
  Carousel: Image,
  Post: FileText,
  Story: CircleDot,
}

const FORMAT_COLORS: Record<ContentFormat, string> = {
  Reel: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Carousel: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Post: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Story: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

const STATUS_COLORS: Record<CalendarStatus, string> = {
  planned: 'bg-text-secondary/10 text-text-secondary',
  creating: 'bg-warning/10 text-warning',
  ready: 'bg-accent/10 text-accent',
  published: 'bg-success/10 text-success',
}

function formatPostCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

// ─── Tab Config ─────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'ideas', label: 'Ideas', icon: Lightbulb },
  { key: 'hooks', label: 'Hooks', icon: Anchor },
  { key: 'hashtags', label: 'Hashtags', icon: Hash },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
]

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ideas')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Content Lab</h1>
        <p className="text-sm text-text-secondary mt-1">
          Create, plan, and schedule your content pipeline
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 rounded-lg bg-surface/50 border border-border/50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center',
                isActive
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="content-tab-bg"
                  className="absolute inset-0 rounded-md bg-surface border border-border"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'ideas' && <IdeasTab />}
          {activeTab === 'hooks' && <HooksTab />}
          {activeTab === 'hashtags' && <HashtagsTab />}
          {activeTab === 'calendar' && <CalendarTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ─── Ideas Tab ──────────────────────────────────────────────────────────────

function IdeasTab() {
  const [ideas, setIdeas] = useState<ContentIdea[]>(DEMO_IDEAS)
  const [formatFilter, setFormatFilter] = useState<ContentFormat | 'All'>('All')
  const [showFilter, setShowFilter] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (formatFilter !== 'All' && idea.format !== formatFilter) return false
      return true
    })
  }, [ideas, formatFilter])

  const handleFeedback = (id: string, action: 'saved' | 'used' | 'skipped') => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, feedback: action } : idea))
    )
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 1500)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Filter className="h-4 w-4" />
            {formatFilter === 'All' ? 'All Formats' : formatFilter}
            <ChevronDown className={cn('h-3 w-3 transition-transform', showFilter && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 mt-1 z-20 rounded-lg border border-border bg-surface shadow-xl overflow-hidden"
              >
                {(['All', 'Reel', 'Carousel', 'Post', 'Story'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFormatFilter(f)
                      setShowFilter(false)
                    }}
                    className={cn(
                      'block w-full px-4 py-2 text-sm text-left hover:bg-background/50 transition-colors',
                      formatFilter === f ? 'text-accent' : 'text-text-secondary'
                    )}
                  >
                    {f === 'All' ? 'All Formats' : f}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Generate New Ideas'}
        </button>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea, i) => (
          <IdeaCard key={idea.id} idea={idea} index={i} onFeedback={handleFeedback} />
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No ideas match this filter. Try a different format.</p>
        </div>
      )}
    </div>
  )
}

function IdeaCard({
  idea,
  index,
  onFeedback,
}: {
  idea: ContentIdea
  index: number
  onFeedback: (id: string, action: 'saved' | 'used' | 'skipped') => void
}) {
  const FormatIcon = FORMAT_ICONS[idea.format]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'hover-card p-5 space-y-3 transition-all',
        idea.feedback === 'skipped' && 'opacity-40'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary leading-snug flex-1">
          {idea.title}
        </h3>
        <span className={cn('text-xs font-medium rounded-full px-2 py-0.5', getScoreBgColor(idea.score))}>
          {idea.score}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn('inline-flex items-center gap-1 text-xs rounded-full border px-2 py-0.5', FORMAT_COLORS[idea.format])}>
          <FormatIcon className="h-3 w-3" />
          {idea.format}
        </span>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed">{idea.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {idea.hashtags.map((tag) => (
          <span key={tag} className="text-[11px] text-accent/70 bg-accent/5 rounded-full px-2 py-0.5">
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/30">
        {idea.feedback ? (
          <div className="flex items-center gap-2 text-xs">
            {idea.feedback === 'saved' && (
              <span className="flex items-center gap-1 text-accent">
                <Bookmark className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            {idea.feedback === 'used' && (
              <span className="flex items-center gap-1 text-success">
                <ThumbsUp className="h-3.5 w-3.5" /> Using this
              </span>
            )}
            {idea.feedback === 'skipped' && (
              <span className="flex items-center gap-1 text-text-secondary">
                <ThumbsDown className="h-3.5 w-3.5" /> Skipped
              </span>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => onFeedback(idea.id, 'saved')}
              className="flex items-center gap-1 text-xs rounded-md bg-accent/10 text-accent px-3 py-1.5 hover:bg-accent/20 transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5" /> Save
            </button>
            <button
              onClick={() => onFeedback(idea.id, 'used')}
              className="flex items-center gap-1 text-xs rounded-md bg-accent text-white px-3 py-1.5 hover:bg-accent-hover transition-colors"
            >
              <Play className="h-3.5 w-3.5" /> Use
            </button>
            <button
              onClick={() => onFeedback(idea.id, 'skipped')}
              className="flex items-center gap-1 text-xs rounded-md border border-border text-text-secondary px-3 py-1.5 hover:text-text-primary transition-colors ml-auto"
            >
              <SkipForward className="h-3.5 w-3.5" /> Skip
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

// ─── Hooks Tab ──────────────────────────────────────────────────────────────

function HooksTab() {
  const [hooks, setHooks] = useState<Hook[]>(DEMO_HOOKS)
  const [hookInput, setHookInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedHooks, setGeneratedHooks] = useState<Hook[]>([])

  const handleCopy = (id: string, text: string, list: 'main' | 'generated') => {
    navigator.clipboard.writeText(text).catch(() => {})
    const setter = list === 'main' ? setHooks : setGeneratedHooks
    setter((prev) =>
      prev.map((h) => (h.id === id ? { ...h, copied: true } : h))
    )
    setTimeout(() => {
      setter((prev) =>
        prev.map((h) => (h.id === id ? { ...h, copied: false } : h))
      )
    }, 2000)
  }

  const handleGenerateVariations = () => {
    if (!hookInput.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedHooks([
        {
          id: 'g1',
          text: `You won't believe what happened when I tried ${hookInput.toLowerCase()}...`,
          formats: ['Reel'],
          example: 'Curiosity gap opener — cut to the moment of truth',
        },
        {
          id: 'g2',
          text: `Here's why ${hookInput.toLowerCase()} changed everything for me 🤯`,
          formats: ['Reel', 'Carousel'],
          example: 'Personal transformation angle — before/after or step-by-step',
        },
        {
          id: 'g3',
          text: `Stop doing ${hookInput.toLowerCase()} wrong. Here's the right way.`,
          formats: ['Reel', 'Post'],
          example: 'Authority/correction hook — demonstrate the correct approach',
        },
        {
          id: 'g4',
          text: `I asked a pro about ${hookInput.toLowerCase()} and this is what they said...`,
          formats: ['Reel'],
          example: 'Expert quote hook — interview snippet or voiceover',
        },
        {
          id: 'g5',
          text: `3 things I wish I knew before ${hookInput.toLowerCase()} 🏄`,
          formats: ['Carousel', 'Reel'],
          example: 'Listicle hook — rapid-fire tips with visual examples',
        },
      ])
      setIsGenerating(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Hook Generator */}
      <div className="hover-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-text-primary">Generate Hook Variations</h2>
        </div>
        <p className="text-xs text-text-secondary">
          Describe your Reel idea and get 5 scroll-stopping hook variations
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={hookInput}
            onChange={(e) => setHookInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateVariations()}
            placeholder="e.g. showing how to read waves before paddling out"
            className="flex-1 rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleGenerateVariations}
            disabled={isGenerating || !hookInput.trim()}
            className="flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate 5 Hooks
          </button>
        </div>

        {/* Generated Hooks */}
        <AnimatePresence>
          {generatedHooks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 pt-2 border-t border-border/30"
            >
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Generated Variations</p>
              {generatedHooks.map((hook, i) => (
                <motion.div
                  key={hook.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <HookCard hook={hook} onCopy={(id, text) => handleCopy(id, text, 'generated')} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trending Hooks */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Anchor className="h-4 w-4 text-accent" />
          Trending Hooks in Your Niche
        </h2>
        <div className="space-y-2">
          {hooks.map((hook, i) => (
            <motion.div
              key={hook.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <HookCard hook={hook} onCopy={(id, text) => handleCopy(id, text, 'main')} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HookCard({ hook, onCopy }: { hook: Hook; onCopy: (id: string, text: string) => void }) {
  return (
    <div className="hover-card p-4 flex items-start gap-4 group">
      <div className="flex-1 space-y-2">
        <p className="text-sm text-text-primary font-medium leading-snug">
          &ldquo;{hook.text}&rdquo;
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {hook.formats.map((f) => {
            const Icon = FORMAT_ICONS[f]
            return (
              <span key={f} className={cn('inline-flex items-center gap-1 text-[11px] rounded-full border px-2 py-0.5', FORMAT_COLORS[f])}>
                <Icon className="h-2.5 w-2.5" />
                {f}
              </span>
            )
          })}
        </div>
        <p className="text-xs text-text-secondary">{hook.example}</p>
      </div>
      <button
        onClick={() => onCopy(hook.id, hook.text)}
        className={cn(
          'shrink-0 rounded-md border p-2 transition-all',
          hook.copied
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-border text-text-secondary hover:text-text-primary hover:border-accent/30'
        )}
      >
        {hook.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ─── Hashtags Tab ───────────────────────────────────────────────────────────

function HashtagsTab() {
  const [topic, setTopic] = useState('')
  const [hashtags, setHashtags] = useState<HashtagSet | null>(DEMO_HASHTAG_SETS)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedSets, setCopiedSets] = useState<Record<string, boolean>>({})
  const [copiedTags, setCopiedTags] = useState<Record<string, boolean>>({})

  const handleGenerate = () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      setHashtags(DEMO_HASHTAG_SETS)
      setIsGenerating(false)
    }, 1000)
  }

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag).catch(() => {})
    setCopiedTags((prev) => ({ ...prev, [tag]: true }))
    setTimeout(() => setCopiedTags((prev) => ({ ...prev, [tag]: false })), 1500)
  }

  const copySet = (setName: string, tags: Hashtag[]) => {
    const text = tags.map((t) => t.tag).join(' ')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopiedSets((prev) => ({ ...prev, [setName]: true }))
    setTimeout(() => setCopiedSets((prev) => ({ ...prev, [setName]: false })), 2000)
  }

  const setConfig: { key: keyof HashtagSet; label: string; description: string }[] = [
    { key: 'primary', label: 'Primary (Niche)', description: 'Core hashtags for your niche audience' },
    { key: 'growth', label: 'Growth (Wider Reach)', description: 'Broader hashtags to expand your reach' },
    { key: 'community', label: 'Community (Engagement)', description: 'Smaller hashtags for deeper engagement' },
  ]

  return (
    <div className="space-y-6">
      {/* Generator Input */}
      <div className="hover-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-accent" />
          <h2 className="font-semibold text-text-primary">Hashtag Set Generator</h2>
        </div>
        <p className="text-xs text-text-secondary">
          Enter your content topic and get optimized hashtag sets grouped by strategy
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g. surfboard maintenance tips"
            className="flex-1 rounded-lg border border-border bg-background/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="flex items-center gap-2 rounded-lg bg-accent text-white px-5 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Generate Sets
          </button>
        </div>
      </div>

      {/* Hashtag Sets */}
      {hashtags && (
        <div className="space-y-4">
          {setConfig.map((config, si) => {
            const tags = hashtags[config.key]
            return (
              <motion.div
                key={config.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 }}
                className="hover-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{config.label}</h3>
                    <p className="text-xs text-text-secondary">{config.description}</p>
                  </div>
                  <button
                    onClick={() => copySet(config.key, tags)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                      copiedSets[config.key]
                        ? 'border-success/30 bg-success/10 text-success'
                        : 'border-border text-text-secondary hover:text-text-primary hover:border-accent/30'
                    )}
                  >
                    {copiedSets[config.key] ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy All
                      </>
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((hashtag) => (
                    <button
                      key={hashtag.tag}
                      onClick={() => copyTag(hashtag.tag)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all',
                        copiedTags[hashtag.tag]
                          ? 'border-success/30 bg-success/10 text-success'
                          : 'border-border bg-background/50 text-text-primary hover:border-accent/30 hover:bg-accent/5'
                      )}
                    >
                      <span className="font-medium">{hashtag.tag}</span>
                      <span className="text-text-secondary text-[10px]">
                        {formatPostCount(hashtag.posts)}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Calendar Tab ───────────────────────────────────────────────────────────

function CalendarTab() {
  const [items, setItems] = useState<CalendarItem[]>(DEMO_CALENDAR)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addDay, setAddDay] = useState<number>(0)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('10:00 AM')
  const [newFormat, setNewFormat] = useState<ContentFormat>('Reel')

  const updateStatus = (id: string, status: CalendarStatus) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    const item: CalendarItem = {
      id: `c${Date.now()}`,
      title: newTitle,
      time: newTime,
      format: newFormat,
      status: 'planned',
      day: addDay,
    }
    setItems((prev) => [...prev, item])
    setNewTitle('')
    setNewTime('10:00 AM')
    setNewFormat('Reel')
    setShowAddModal(false)
  }

  const openAddForDay = (day: number) => {
    setAddDay(day)
    setShowAddModal(true)
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Calendar className="h-4 w-4 text-accent" />
          This Week
        </h2>
        <button
          onClick={() => openAddForDay(TODAY_INDEX)}
          className="flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add to Calendar
        </button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {DAY_LABELS.map((label, i) => {
          const date = WEEK_DATES[i]
          const isToday = i === TODAY_INDEX
          return (
            <div
              key={label}
              className={cn(
                'text-center rounded-t-lg py-2 border-b-2',
                isToday ? 'border-accent' : 'border-border/30'
              )}
            >
              <p className={cn('text-xs font-medium', isToday ? 'text-accent' : 'text-text-secondary')}>
                {label}
              </p>
              <p className={cn('text-lg font-bold', isToday ? 'text-accent' : 'text-text-primary')}>
                {date.getDate()}
              </p>
            </div>
          )
        })}

        {/* Day Columns */}
        {DAY_LABELS.map((_, dayIndex) => {
          const dayItems = items
            .filter((item) => item.day === dayIndex)
            .sort((a, b) => a.time.localeCompare(b.time))
          const isToday = dayIndex === TODAY_INDEX

          return (
            <div
              key={dayIndex}
              className={cn(
                'min-h-[200px] rounded-b-lg p-1.5 space-y-1.5 border',
                isToday ? 'border-accent/30 bg-accent/5' : 'border-border/20 bg-surface/20'
              )}
            >
              {dayItems.map((item) => (
                <CalendarCard key={item.id} item={item} onStatusChange={updateStatus} />
              ))}
              <button
                onClick={() => openAddForDay(dayIndex)}
                className="w-full rounded-md border border-dashed border-border/40 py-2 text-text-secondary/40 hover:text-text-secondary hover:border-border transition-colors"
              >
                <Plus className="h-3.5 w-3.5 mx-auto" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-border bg-surface p-6 space-y-4 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-text-primary">
                Add Content — {DAY_LABELS[addDay]}, {WEEK_DATES[addDay].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Content title..."
                    className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/50"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-text-secondary mb-1.5">Time</label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    >
                      {['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
                        '8:00 PM', '9:00 PM',
                      ].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-text-secondary mb-1.5">Format</label>
                    <select
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value as ContentFormat)}
                      className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/50"
                    >
                      {(['Reel', 'Carousel', 'Post', 'Story'] as ContentFormat[]).map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-lg border border-border py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newTitle.trim()}
                  className="flex-1 rounded-lg bg-accent text-white py-2 text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  Add Content
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CalendarCard({
  item,
  onStatusChange,
}: {
  item: CalendarItem
  onStatusChange: (id: string, status: CalendarStatus) => void
}) {
  const [showStatus, setShowStatus] = useState(false)
  const FormatIcon = FORMAT_ICONS[item.format]
  const statuses: CalendarStatus[] = ['planned', 'creating', 'ready', 'published']

  return (
    <div className="rounded-md border border-border/40 bg-surface/80 p-2 space-y-1.5 group">
      <p className="text-[11px] font-medium text-text-primary leading-tight truncate">
        {item.title}
      </p>
      <div className="flex items-center gap-1.5">
        <Clock className="h-2.5 w-2.5 text-text-secondary" />
        <span className="text-[10px] text-text-secondary font-mono">{item.time}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className={cn('inline-flex items-center gap-0.5 text-[10px] rounded-full border px-1.5 py-0.5', FORMAT_COLORS[item.format])}>
          <FormatIcon className="h-2.5 w-2.5" />
          {item.format}
        </span>
      </div>
      {/* Status Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowStatus(!showStatus)}
          className={cn(
            'w-full text-[10px] rounded-full px-2 py-0.5 font-medium text-center capitalize transition-colors',
            STATUS_COLORS[item.status]
          )}
        >
          {item.status}
        </button>
        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              className="absolute bottom-full left-0 right-0 mb-1 z-30 rounded-md border border-border bg-surface shadow-xl overflow-hidden"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(item.id, s)
                    setShowStatus(false)
                  }}
                  className={cn(
                    'block w-full px-2 py-1.5 text-[10px] text-left capitalize hover:bg-background/50 transition-colors',
                    item.status === s ? 'text-accent font-medium' : 'text-text-secondary'
                  )}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
