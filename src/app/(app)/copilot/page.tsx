'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  Check,
  SkipForward,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Clock,
  Users,
  MessageSquare,
  Lightbulb,
  Calendar,
  Handshake,
  XOctagon,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Zap,
} from 'lucide-react'
import { cn, getScoreBgColor, formatNumber } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ItemStatus = 'pending' | 'done' | 'skipped' | 'saved'
type Feedback = 'up' | 'down' | null

interface AccountItem {
  id: string
  name: string
  handle: string
  followers: number
  reason: string
  relevanceScore: number
  status: ItemStatus
  feedback: Feedback
}

interface PostItem {
  id: string
  description: string
  suggestedComment: string
  reason: string
  status: ItemStatus
  feedback: Feedback
}

interface ContentIdea {
  id: string
  title: string
  format: string
  description: string
  potentialScore: number
  status: ItemStatus
  feedback: Feedback
}

interface PostingWindow {
  time: string
  reason: string
  feedback: Feedback
}

interface CollaborationTarget {
  id: string
  name: string
  handle: string
  why: string
  potentialScore: number
  status: ItemStatus
  feedback: Feedback
}

interface StopDoing {
  id: string
  title: string
  explanation: string
  feedback: Feedback
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const initialAccounts: AccountItem[] = [
  { id: 'a1', name: 'Sarah Chen', handle: '@sarahchenfit', followers: 48200, reason: 'Shared audience in fitness niche, high engagement rate (6.2%). Her followers overlap 34% with your target demo.', relevanceScore: 92, status: 'pending', feedback: null },
  { id: 'a2', name: 'Mark Rivera', handle: '@markrivera.co', followers: 15800, reason: 'Active commenter on similar accounts. Recently posted about topics you cover. Likely to engage back.', relevanceScore: 87, status: 'pending', feedback: null },
  { id: 'a3', name: 'Luna Digital', handle: '@lunadigitalstudio', followers: 72400, reason: 'Complementary brand in your space. Collaboration potential is high based on content overlap.', relevanceScore: 85, status: 'pending', feedback: null },
  { id: 'a4', name: 'Alex Thompson', handle: '@alexthompson_', followers: 9300, reason: 'Micro-influencer with extremely engaged audience. 8.1% engagement rate, niche alignment score: 91.', relevanceScore: 83, status: 'pending', feedback: null },
  { id: 'a5', name: 'Wellness Hub', handle: '@thewellnesshub', followers: 125000, reason: 'Trending account in adjacent niche. Engaging now could lead to algorithmic association benefits.', relevanceScore: 80, status: 'pending', feedback: null },
  { id: 'a6', name: 'Jamie Lee', handle: '@jamielee.creates', followers: 22100, reason: 'Recently followed 3 accounts similar to yours. High intent signal for your content type.', relevanceScore: 78, status: 'pending', feedback: null },
  { id: 'a7', name: 'Mindful Living', handle: '@mindful.living.co', followers: 55600, reason: 'Their audience demographics match your ideal follower profile. Cross-pollination opportunity.', relevanceScore: 76, status: 'pending', feedback: null },
  { id: 'a8', name: 'Priya Sharma', handle: '@priyasharma.life', followers: 18700, reason: 'Engaged with your last 3 posts. Returning the engagement will strengthen the algorithmic connection.', relevanceScore: 74, status: 'pending', feedback: null },
  { id: 'a9', name: 'Growth Lab', handle: '@growthlab.io', followers: 41200, reason: 'Similar growth trajectory. Accounts at this stage often benefit from mutual engagement strategies.', relevanceScore: 71, status: 'pending', feedback: null },
  { id: 'a10', name: 'Nora Kim', handle: '@norakim.daily', followers: 6800, reason: 'Rising creator in your niche. Early engagement with growing accounts yields the highest ROI.', relevanceScore: 68, status: 'pending', feedback: null },
]

const initialPosts: PostItem[] = [
  { id: 'p1', description: '@sarahchenfit\'s carousel on "5 Morning Habits"', suggestedComment: 'This is gold! Number 3 completely changed my routine last month. Have you tried combining it with cold exposure?', reason: 'High-performing post (2.4K likes in 3h). Early meaningful comment will get pinned visibility.', status: 'pending', feedback: null },
  { id: 'p2', description: '@markrivera.co\'s reel about productivity tools', suggestedComment: 'Finally someone talking about this! The Notion template approach is underrated. Would love to see a deep dive on your automation setup.', reason: 'Trending reel with high save rate. Your comment will reach his engaged audience.', status: 'pending', feedback: null },
  { id: 'p3', description: '@thewellnesshub\'s infographic on sleep science', suggestedComment: 'The data on REM cycles here is fascinating. This aligns with what I\'ve been sharing about recovery protocols.', reason: 'Educational content with high share potential. Positions you as a knowledgeable peer.', status: 'pending', feedback: null },
  { id: 'p4', description: '@alexthompson_\'s story about audience growth', suggestedComment: 'Love the transparency here! The 30-day challenge approach worked incredibly well for me too. Key is consistency over perfection.', reason: 'Vulnerability post generating high engagement. Supportive comments get strong positive response.', status: 'pending', feedback: null },
  { id: 'p5', description: '@lunadigitalstudio\'s brand redesign showcase', suggestedComment: 'The color palette evolution is stunning. How long did the discovery phase take? This level of intentionality really shows.', reason: 'Portfolio post attracting potential clients. Your thoughtful comment adds credibility.', status: 'pending', feedback: null },
  { id: 'p6', description: '@jamielee.creates\' tutorial on Reels editing', suggestedComment: 'Bookmarking this immediately. The transition at 0:23 is smooth. What app do you use for the motion tracking?', reason: 'Tutorial content with high save rate. Asking specific questions drives thread engagement.', status: 'pending', feedback: null },
  { id: 'p7', description: '@mindful.living.co\'s quote post about boundaries', suggestedComment: 'Needed this reminder today. Setting boundaries is the most underrated growth strategy, both personally and professionally.', reason: 'Viral-potential quote post. Relatable comments get high like counts from the broader audience.', status: 'pending', feedback: null },
  { id: 'p8', description: '@priyasharma.life\'s behind-the-scenes content day', suggestedComment: 'The raw, unfiltered process is so much more valuable than the polished result. This is what people connect with!', reason: 'BTS content signals authenticity. Supporting this type of content strengthens your relationship.', status: 'pending', feedback: null },
  { id: 'p9', description: '@growthlab.io\'s data breakdown on engagement rates', suggestedComment: 'The correlation between posting time and save rates is eye-opening. Have you segmented this by content type?', reason: 'Data-driven post attracting analytical audience. Your comment shows domain expertise.', status: 'pending', feedback: null },
  { id: 'p10', description: '@norakim.daily\'s first viral post celebration', suggestedComment: 'Congratulations! This is just the beginning. The authenticity in your content is exactly why it resonated. Keep going!', reason: 'Milestone post. Supporting rising creators early builds the strongest community connections.', status: 'pending', feedback: null },
]

const initialContentIdeas: ContentIdea[] = [
  { id: 'c1', title: 'The 80/20 Rule of Instagram Growth', format: 'Carousel', description: 'Break down which 20% of actions drive 80% of your growth. Use your own analytics as proof. Include actionable steps in each slide with before/after metrics.', potentialScore: 94, status: 'pending', feedback: null },
  { id: 'c2', title: 'Day in My Life: The Unfiltered Version', format: 'Reel', description: 'Show the real behind-the-scenes of your day, including the messy parts. Authenticity content is trending +47% this month in your niche.', potentialScore: 88, status: 'pending', feedback: null },
  { id: 'c3', title: 'Hot Take: Why Follower Count Doesn\'t Matter', format: 'Static Post', description: 'Contrarian take backed by data. Posts challenging common beliefs get 3.2x more comments than agreeable content. Include engagement rate comparisons.', potentialScore: 81, status: 'pending', feedback: null },
]

const initialPostingWindow: PostingWindow = {
  time: '6:30 PM - 7:30 PM',
  reason: 'Your audience is 73% more active during this window on Tuesdays. Last 4 posts in this slot averaged 2.1x your normal engagement. Avoid posting before 4 PM today as competitor accounts have scheduled major drops.',
  feedback: null,
}

const initialCollabTarget: CollaborationTarget = {
  id: 'col1',
  name: 'Wellness Collective',
  handle: '@wellnesscollective',
  why: 'They have 89K followers with 62% audience overlap. They recently started a guest series and are actively looking for collaborators. Their engagement rate of 5.8% indicates a highly active community. A joint IG Live or carousel swap could expose you to ~55K new relevant followers.',
  potentialScore: 91,
  status: 'pending',
  feedback: null,
}

const initialStopDoing: StopDoing = {
  id: 's1',
  title: 'Stop posting single-image posts without a CTA',
  explanation: 'Your last 8 single-image posts without a clear call-to-action averaged 0.9% engagement vs. 4.2% for posts with CTAs. This is dragging down your overall engagement rate, which signals to the algorithm that your content isn\'t resonating. Switch every static post to include a question or prompt in the caption.',
  feedback: null,
}

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: ItemStatus }) {
  const config = {
    pending: { label: 'Pending', cls: 'bg-text-secondary/10 text-text-secondary' },
    done: { label: 'Done', cls: 'bg-success/10 text-success' },
    skipped: { label: 'Skipped', cls: 'bg-warning/10 text-warning' },
    saved: { label: 'Saved', cls: 'bg-accent/10 text-accent' },
  }
  const c = config[status]
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', c.cls)}>
      {c.label}
    </span>
  )
}

function FeedbackButtons({
  feedback,
  onFeedback,
}: {
  feedback: Feedback
  onFeedback: (v: Feedback) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onFeedback(feedback === 'up' ? null : 'up')}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          feedback === 'up'
            ? 'bg-success/20 text-success'
            : 'text-text-secondary hover:text-success hover:bg-success/10'
        )}
      >
        <ThumbsUp size={14} />
      </button>
      <button
        onClick={() => onFeedback(feedback === 'down' ? null : 'down')}
        className={cn(
          'p-1.5 rounded-lg transition-colors',
          feedback === 'down'
            ? 'bg-danger/20 text-danger'
            : 'text-text-secondary hover:text-danger hover:bg-danger/10'
        )}
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  variant = 'default',
  onClick,
  disabled,
}: {
  icon: React.ElementType
  label: string
  variant?: 'default' | 'success' | 'accent' | 'warning'
  onClick: () => void
  disabled?: boolean
}) {
  const variants = {
    default: 'border-border text-text-secondary hover:border-text-secondary hover:text-text-primary',
    success: 'border-success/30 text-success hover:bg-success/10',
    accent: 'border-accent/30 text-accent hover:bg-accent/10',
    warning: 'border-warning/30 text-warning hover:bg-warning/10',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
        disabled ? 'opacity-40 cursor-not-allowed' : variants[variant]
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  count,
  completedCount,
  collapsed,
  onToggle,
}: {
  icon: React.ElementType
  title: string
  count?: number
  completedCount?: number
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-accent/10">
          <Icon size={18} className="text-accent" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-text-secondary bg-surface px-2 py-0.5 rounded-full border border-border">
            {completedCount !== undefined ? `${completedCount}/${count}` : count}
          </span>
        )}
      </div>
      <div className="text-text-secondary group-hover:text-text-primary transition-colors">
        {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </div>
    </button>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])
  return (
    <button
      onClick={handleCopy}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all',
        copied
          ? 'bg-success/20 text-success'
          : 'bg-surface text-text-secondary hover:text-accent border border-border hover:border-accent/30'
      )}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Item Animation Wrapper
// ---------------------------------------------------------------------------

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: 'easeOut' },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function CopilotPage() {
  // State
  const [accounts, setAccounts] = useState<AccountItem[]>(initialAccounts)
  const [posts, setPosts] = useState<PostItem[]>(initialPosts)
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>(initialContentIdeas)
  const [postingWindow, setPostingWindow] = useState<PostingWindow>(initialPostingWindow)
  const [collabTarget, setCollabTarget] = useState<CollaborationTarget>(initialCollabTarget)
  const [stopDoing, setStopDoing] = useState<StopDoing>(initialStopDoing)
  const [regenerating, setRegenerating] = useState(false)

  // Collapsed sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    accounts: false,
    posts: false,
    ideas: false,
    window: false,
    collab: false,
    stop: false,
  })

  const toggleSection = (key: string) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))

  // Aggregated progress
  const allActionItems = [...accounts, ...posts, ...contentIdeas, collabTarget]
  const totalItems = allActionItems.length
  const completedItems = allActionItems.filter(
    (i) => i.status === 'done' || i.status === 'skipped' || i.status === 'saved'
  ).length
  const progressPct = totalItems > 0 ? (completedItems / totalItems) * 100 : 0

  // Generic updaters
  const updateAccount = (id: string, patch: Partial<AccountItem>) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const updatePost = (id: string, patch: Partial<PostItem>) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))

  const updateIdea = (id: string, patch: Partial<ContentIdea>) =>
    setContentIdeas((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const handleRegenerate = () => {
    setRegenerating(true)
    setTimeout(() => {
      setAccounts(initialAccounts.map((a) => ({ ...a, status: 'pending' as const, feedback: null })))
      setPosts(initialPosts.map((p) => ({ ...p, status: 'pending' as const, feedback: null })))
      setContentIdeas(initialContentIdeas.map((c) => ({ ...c, status: 'pending' as const, feedback: null })))
      setPostingWindow({ ...initialPostingWindow, feedback: null })
      setCollabTarget({ ...initialCollabTarget, status: 'pending' as const, feedback: null })
      setStopDoing({ ...initialStopDoing, feedback: null })
      setRegenerating(false)
    }, 1500)
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Helper counts per section
  const accountsDone = accounts.filter((a) => a.status !== 'pending').length
  const postsDone = posts.filter((p) => p.status !== 'pending').length
  const ideasDone = contentIdeas.filter((c) => c.status !== 'pending').length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} className="text-accent" />
                <h1 className="text-2xl font-bold text-text-primary">Daily Copilot</h1>
              </div>
              <p className="text-sm text-text-secondary">{today}</p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium transition-all',
                regenerating
                  ? 'text-text-secondary cursor-not-allowed'
                  : 'text-accent hover:bg-accent/10 hover:border-accent/30'
              )}
            >
              <RefreshCw
                size={15}
                className={cn(regenerating && 'animate-spin')}
              />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>

          {/* Progress bar */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Today&apos;s progress
              </span>
              <span className="font-semibold text-text-primary">
                {completedItems} of {totalItems} actions
              </span>
            </div>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-text-secondary">
              {progressPct === 100
                ? 'All done for today! Great work.'
                : progressPct >= 50
                  ? 'You\'re making great progress. Keep going!'
                  : 'Knock out a few actions to build momentum.'}
            </p>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Accounts to Visit                                       */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <SectionHeader
            icon={Users}
            title="Accounts to Visit"
            count={accounts.length}
            completedCount={accountsDone}
            collapsed={collapsed.accounts}
            onToggle={() => toggleSection('accounts')}
          />
          <AnimatePresence>
            {!collapsed.accounts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                {accounts.map((account, i) => (
                  <motion.div
                    key={account.id}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      'hover-card p-4 space-y-3',
                      account.status === 'done' && 'opacity-60',
                      account.status === 'skipped' && 'opacity-40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text-primary">{account.name}</span>
                          <span className="text-xs text-text-secondary">{account.handle}</span>
                          <span className="text-xs text-text-secondary">
                            {formatNumber(account.followers)} followers
                          </span>
                          <StatusBadge status={account.status} />
                        </div>
                        <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                          {account.reason}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold',
                          getScoreBgColor(account.relevanceScore)
                        )}
                      >
                        {account.relevanceScore}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ActionButton
                          icon={Check}
                          label="Done"
                          variant="success"
                          onClick={() => updateAccount(account.id, { status: 'done' })}
                          disabled={account.status !== 'pending'}
                        />
                        <ActionButton
                          icon={SkipForward}
                          label="Skip"
                          variant="warning"
                          onClick={() => updateAccount(account.id, { status: 'skipped' })}
                          disabled={account.status !== 'pending'}
                        />
                        <ActionButton
                          icon={Bookmark}
                          label="Save"
                          variant="accent"
                          onClick={() => updateAccount(account.id, { status: 'saved' })}
                          disabled={account.status !== 'pending'}
                        />
                      </div>
                      <FeedbackButtons
                        feedback={account.feedback}
                        onFeedback={(fb) => updateAccount(account.id, { feedback: fb })}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Posts to Engage With                                     */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <SectionHeader
            icon={MessageSquare}
            title="Posts to Engage With"
            count={posts.length}
            completedCount={postsDone}
            collapsed={collapsed.posts}
            onToggle={() => toggleSection('posts')}
          />
          <AnimatePresence>
            {!collapsed.posts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      'hover-card p-4 space-y-3',
                      post.status === 'done' && 'opacity-60',
                      post.status === 'skipped' && 'opacity-40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text-primary text-sm">
                            {post.description}
                          </span>
                          <StatusBadge status={post.status} />
                        </div>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                          {post.reason}
                        </p>
                      </div>
                    </div>
                    <div className="bg-background/60 rounded-lg p-3 border border-border/50">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-text-primary leading-relaxed flex-1">
                          &ldquo;{post.suggestedComment}&rdquo;
                        </p>
                        <CopyButton text={post.suggestedComment} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ActionButton
                          icon={Check}
                          label="Done"
                          variant="success"
                          onClick={() => updatePost(post.id, { status: 'done' })}
                          disabled={post.status !== 'pending'}
                        />
                        <ActionButton
                          icon={SkipForward}
                          label="Skip"
                          variant="warning"
                          onClick={() => updatePost(post.id, { status: 'skipped' })}
                          disabled={post.status !== 'pending'}
                        />
                        <ActionButton
                          icon={Bookmark}
                          label="Save"
                          variant="accent"
                          onClick={() => updatePost(post.id, { status: 'saved' })}
                          disabled={post.status !== 'pending'}
                        />
                      </div>
                      <FeedbackButtons
                        feedback={post.feedback}
                        onFeedback={(fb) => updatePost(post.id, { feedback: fb })}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Content Ideas                                           */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <SectionHeader
            icon={Lightbulb}
            title="Content Ideas"
            count={contentIdeas.length}
            completedCount={ideasDone}
            collapsed={collapsed.ideas}
            onToggle={() => toggleSection('ideas')}
          />
          <AnimatePresence>
            {!collapsed.ideas && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                {contentIdeas.map((idea, i) => (
                  <motion.div
                    key={idea.id}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className={cn(
                      'hover-card p-4 space-y-3',
                      idea.status === 'done' && 'opacity-60',
                      idea.status === 'skipped' && 'opacity-40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-text-primary">{idea.title}</span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                            {idea.format}
                          </span>
                          <StatusBadge status={idea.status} />
                        </div>
                        <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                          {idea.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-center">
                        <div
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-bold',
                            getScoreBgColor(idea.potentialScore)
                          )}
                        >
                          {idea.potentialScore}
                        </div>
                        <span className="text-[10px] text-text-secondary">potential</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ActionButton
                          icon={Bookmark}
                          label="Save"
                          variant="accent"
                          onClick={() => updateIdea(idea.id, { status: 'saved' })}
                          disabled={idea.status !== 'pending'}
                        />
                        <ActionButton
                          icon={Zap}
                          label="Use"
                          variant="success"
                          onClick={() => updateIdea(idea.id, { status: 'done' })}
                          disabled={idea.status !== 'pending'}
                        />
                        <ActionButton
                          icon={SkipForward}
                          label="Skip"
                          variant="warning"
                          onClick={() => updateIdea(idea.id, { status: 'skipped' })}
                          disabled={idea.status !== 'pending'}
                        />
                      </div>
                      <FeedbackButtons
                        feedback={idea.feedback}
                        onFeedback={(fb) => updateIdea(idea.id, { feedback: fb })}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Best Posting Window                                     */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <SectionHeader
            icon={Clock}
            title="Best Posting Window"
            collapsed={collapsed.window}
            onToggle={() => toggleSection('window')}
          />
          <AnimatePresence>
            {!collapsed.window && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="hover-card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
                      <Calendar size={16} className="text-accent" />
                      <span className="text-lg font-bold text-accent">
                        {postingWindow.time}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {postingWindow.reason}
                  </p>
                  <div className="flex justify-end mt-3">
                    <FeedbackButtons
                      feedback={postingWindow.feedback}
                      onFeedback={(fb) =>
                        setPostingWindow((prev) => ({ ...prev, feedback: fb }))
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Collaboration Target                                    */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-4"
        >
          <SectionHeader
            icon={Handshake}
            title="Collaboration Target"
            collapsed={collapsed.collab}
            onToggle={() => toggleSection('collab')}
          />
          <AnimatePresence>
            {!collapsed.collab && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    'hover-card p-5 space-y-3',
                    collabTarget.status === 'saved' && 'border-accent/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-text-primary text-lg">
                          {collabTarget.name}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {collabTarget.handle}
                        </span>
                        <StatusBadge status={collabTarget.status} />
                      </div>
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                        {collabTarget.why}
                      </p>
                    </div>
                    <div className="shrink-0 text-center">
                      <div
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-bold',
                          getScoreBgColor(collabTarget.potentialScore)
                        )}
                      >
                        {collabTarget.potentialScore}
                      </div>
                      <span className="text-[10px] text-text-secondary">collab score</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <ActionButton
                      icon={Bookmark}
                      label="Save to Outreach"
                      variant="accent"
                      onClick={() =>
                        setCollabTarget((prev) => ({ ...prev, status: 'saved' }))
                      }
                      disabled={collabTarget.status !== 'pending'}
                    />
                    <FeedbackButtons
                      feedback={collabTarget.feedback}
                      onFeedback={(fb) =>
                        setCollabTarget((prev) => ({ ...prev, feedback: fb }))
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        {/* Section: Stop Doing                                              */}
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <SectionHeader
            icon={XOctagon}
            title="Stop Doing"
            collapsed={collapsed.stop}
            onToggle={() => toggleSection('stop')}
          />
          <AnimatePresence>
            {!collapsed.stop && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="hover-card p-5 border-danger/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-danger/10 shrink-0 mt-0.5">
                      <XOctagon size={16} className="text-danger" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">
                        {stopDoing.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                        {stopDoing.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <FeedbackButtons
                      feedback={stopDoing.feedback}
                      onFeedback={(fb) =>
                        setStopDoing((prev) => ({ ...prev, feedback: fb }))
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  )
}
