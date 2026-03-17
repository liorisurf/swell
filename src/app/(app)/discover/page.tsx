'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Hash, Compass, Users, ExternalLink, X, Plus,
  TrendingUp, Bookmark, Sparkles, Link2, ArrowUpRight,
  ChevronDown, Loader2, Star, Zap, Target, Eye,
} from 'lucide-react'
import { cn, formatNumber, getScoreBgColor } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = 'accounts' | 'hashtags' | 'topics'
type ListKey = 'competitors' | 'inspiration' | 'collaboration' | 'audience'

interface DiscoverAccount {
  id: string
  username: string
  displayName: string
  avatarColor: string
  initial: string
  followers: number
  engagementRate: number
  contentTags: string[]
  relevanceScore: number
  opportunityScore: number
  collaborationPotential: 'High' | 'Medium' | 'Low'
}

interface DiscoverHashtag {
  id: string
  tag: string
  postCount: number
  relevanceScore: number
}

interface DiscoverTopic {
  id: string
  topic: string
  source: string
  momentumScore: number
}

// ---------------------------------------------------------------------------
// Demo Data
// ---------------------------------------------------------------------------

const DEMO_ACCOUNTS: DiscoverAccount[] = [
  {
    id: 'a1', username: 'surfculture.co', displayName: 'Surf Culture', avatarColor: '#00A896',
    initial: 'S', followers: 84200, engagementRate: 5.3, contentTags: ['Lifestyle', 'Reels', 'UGC'],
    relevanceScore: 92, opportunityScore: 78, collaborationPotential: 'High',
  },
  {
    id: 'a2', username: 'wave.journal', displayName: 'Wave Journal', avatarColor: '#6366F1',
    initial: 'W', followers: 31400, engagementRate: 7.1, contentTags: ['Photography', 'Editorial'],
    relevanceScore: 87, opportunityScore: 85, collaborationPotential: 'High',
  },
  {
    id: 'a3', username: 'boardriders_official', displayName: 'Boardriders', avatarColor: '#F59E0B',
    initial: 'B', followers: 245000, engagementRate: 2.1, contentTags: ['Brand', 'Product', 'Events'],
    relevanceScore: 74, opportunityScore: 45, collaborationPotential: 'Medium',
  },
  {
    id: 'a4', username: 'oceanlens', displayName: 'Ocean Lens', avatarColor: '#EC4899',
    initial: 'O', followers: 19800, engagementRate: 8.4, contentTags: ['Photography', 'Nature', 'Reels'],
    relevanceScore: 81, opportunityScore: 91, collaborationPotential: 'High',
  },
  {
    id: 'a5', username: 'saltwater.soul', displayName: 'Saltwater Soul', avatarColor: '#10B981',
    initial: 'S', followers: 56700, engagementRate: 4.8, contentTags: ['Lifestyle', 'Travel', 'Wellness'],
    relevanceScore: 68, opportunityScore: 62, collaborationPotential: 'Medium',
  },
  {
    id: 'a6', username: 'fins.and.foam', displayName: 'Fins & Foam', avatarColor: '#8B5CF6',
    initial: 'F', followers: 8900, engagementRate: 11.2, contentTags: ['DIY', 'Education', 'Reels'],
    relevanceScore: 79, opportunityScore: 94, collaborationPotential: 'High',
  },
]

const DEMO_HASHTAGS: DiscoverHashtag[] = [
  { id: 'h1', tag: '#surflife', postCount: 4200000, relevanceScore: 95 },
  { id: 'h2', tag: '#oceanvibes', postCount: 1800000, relevanceScore: 88 },
  { id: 'h3', tag: '#longboarding', postCount: 920000, relevanceScore: 82 },
  { id: 'h4', tag: '#surftok', postCount: 650000, relevanceScore: 91 },
  { id: 'h5', tag: '#wavecheck', postCount: 340000, relevanceScore: 76 },
  { id: 'h6', tag: '#boardwax', postCount: 89000, relevanceScore: 71 },
  { id: 'h7', tag: '#salsurfer', postCount: 210000, relevanceScore: 64 },
  { id: 'h8', tag: '#sunsetsurf', postCount: 1100000, relevanceScore: 85 },
]

const DEMO_TOPICS: DiscoverTopic[] = [
  { id: 't1', topic: 'Film photography comeback', source: 'Cross-platform', momentumScore: 87 },
  { id: 't2', topic: 'Eco-friendly board materials', source: 'Reddit + IG', momentumScore: 79 },
  { id: 't3', topic: 'Solo surf travel vlogs', source: 'YouTube + Reels', momentumScore: 92 },
  { id: 't4', topic: 'Cold water surfing gear', source: 'TikTok', momentumScore: 71 },
  { id: 't5', topic: 'Surf fitness routines', source: 'IG Reels', momentumScore: 84 },
  { id: 't6', topic: 'Van life x surfing', source: 'Cross-platform', momentumScore: 68 },
]

const LIST_META: Record<ListKey, { label: string; icon: React.ElementType; color: string }> = {
  competitors: { label: 'Competitors', icon: Target, color: 'text-danger' },
  inspiration: { label: 'Inspiration', icon: Star, color: 'text-warning' },
  collaboration: { label: 'Collaboration', icon: Users, color: 'text-accent' },
  audience: { label: 'Audience Sources', icon: Eye, color: 'text-purple-400' },
}

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'accounts', label: 'Accounts', icon: Users },
  { key: 'hashtags', label: 'Hashtags', icon: Hash },
  { key: 'topics', label: 'Topics', icon: Compass },
]

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('accounts')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeList, setActiveList] = useState<ListKey | null>(null)

  // URL analysis state
  const [urlInput, setUrlInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzedAccount, setAnalyzedAccount] = useState<DiscoverAccount | null>(null)

  // Saved lists
  const [savedLists, setSavedLists] = useState<Record<ListKey, string[]>>({
    competitors: ['a3'],
    inspiration: ['a1', 'a2'],
    collaboration: ['a4'],
    audience: ['a5'],
  })

  // Dismissed accounts
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Save to list
  const saveToList = useCallback((accountId: string, list: ListKey) => {
    setSavedLists(prev => {
      const current = prev[list]
      if (current.includes(accountId)) return prev
      return { ...prev, [list]: [...current, accountId] }
    })
  }, [])

  // Remove from list
  const removeFromList = useCallback((accountId: string, list: ListKey) => {
    setSavedLists(prev => ({
      ...prev,
      [list]: prev[list].filter(id => id !== accountId),
    }))
  }, [])

  // Dismiss account
  const dismissAccount = useCallback((accountId: string) => {
    setDismissed(prev => new Set(prev).add(accountId))
  }, [])

  // Handle URL analysis
  const handleAnalyze = useCallback(() => {
    if (!urlInput.trim()) return
    setAnalyzing(true)
    setAnalyzedAccount(null)
    // Simulate API call
    setTimeout(() => {
      setAnalyzedAccount({
        id: 'analyzed-1',
        username: 'analyzed_profile',
        displayName: 'Analyzed Profile',
        avatarColor: '#00A896',
        initial: 'A',
        followers: 42300,
        engagementRate: 6.2,
        contentTags: ['Lifestyle', 'Travel', 'Photography'],
        relevanceScore: 83,
        opportunityScore: 76,
        collaborationPotential: 'High',
      })
      setAnalyzing(false)
    }, 2000)
  }, [urlInput])

  // Filtered data
  const filteredAccounts = useMemo(() => {
    let list = DEMO_ACCOUNTS.filter(a => !dismissed.has(a.id))
    if (activeList) {
      const ids = savedLists[activeList]
      list = list.filter(a => ids.includes(a.id))
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(
        a =>
          a.username.toLowerCase().includes(q) ||
          a.displayName.toLowerCase().includes(q) ||
          a.contentTags.some(t => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [debouncedSearch, dismissed, activeList, savedLists])

  const filteredHashtags = useMemo(() => {
    if (!debouncedSearch) return DEMO_HASHTAGS
    const q = debouncedSearch.toLowerCase()
    return DEMO_HASHTAGS.filter(h => h.tag.toLowerCase().includes(q))
  }, [debouncedSearch])

  const filteredTopics = useMemo(() => {
    if (!debouncedSearch) return DEMO_TOPICS
    const q = debouncedSearch.toLowerCase()
    return DEMO_TOPICS.filter(t =>
      t.topic.toLowerCase().includes(q) || t.source.toLowerCase().includes(q)
    )
  }, [debouncedSearch])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Discover</h1>
        <p className="text-sm text-text-secondary mt-1">
          Find accounts, hashtags, and topics to grow your audience
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search accounts, hashtags, or topics..."
          className="w-full rounded-lg bg-surface border border-border pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* URL Submission */}
      <div className="hover-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-text-primary">Analyze Instagram Profile or Post</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            placeholder="Paste an Instagram URL (e.g. instagram.com/username)"
            className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
          />
          <button
            onClick={handleAnalyze}
            disabled={!urlInput.trim() || analyzing}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Analyze
          </button>
        </div>

        {/* Loading Skeleton */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <AnalysisSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyzed Account Card */}
        <AnimatePresence>
          {analyzedAccount && !analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <AccountSummaryCard
                account={analyzedAccount}
                onSave={saveToList}
                onDismiss={() => setAnalyzedAccount(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved Lists + Tab Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved Lists Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Saved Lists
          </h3>
          <button
            onClick={() => setActiveList(null)}
            className={cn(
              'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left',
              activeList === null
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-text-secondary hover:bg-surface hover:text-text-primary'
            )}
          >
            <Compass className="h-4 w-4" />
            <span className="flex-1">All Discovered</span>
            <span className="text-xs opacity-60">{DEMO_ACCOUNTS.filter(a => !dismissed.has(a.id)).length}</span>
          </button>
          {(Object.keys(LIST_META) as ListKey[]).map(key => {
            const meta = LIST_META[key]
            const Icon = meta.icon
            return (
              <button
                key={key}
                onClick={() => setActiveList(activeList === key ? null : key)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors text-left',
                  activeList === key
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                )}
              >
                <Icon className={cn('h-4 w-4', meta.color)} />
                <span className="flex-1">{meta.label}</span>
                <span className="text-xs opacity-60">{savedLists[key].length}</span>
              </button>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-lg bg-surface/50 border border-border p-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setActiveList(null) }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
                    activeTab === tab.key
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {activeTab === 'accounts' && (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-4"
              >
                {filteredAccounts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-text-secondary text-sm">
                    No accounts found{debouncedSearch ? ` matching "${debouncedSearch}"` : ''}.
                  </div>
                ) : (
                  filteredAccounts.map((account, i) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <AccountCard
                        account={account}
                        savedLists={savedLists}
                        onSave={saveToList}
                        onRemove={removeFromList}
                        onDismiss={dismissAccount}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'hashtags' && (
              <motion.div
                key="hashtags"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredHashtags.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-text-secondary text-sm">
                    No hashtags found{debouncedSearch ? ` matching "${debouncedSearch}"` : ''}.
                  </div>
                ) : (
                  filteredHashtags.map((hashtag, i) => (
                    <motion.div
                      key={hashtag.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <HashtagCard hashtag={hashtag} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'topics' && (
              <motion.div
                key="topics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredTopics.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-text-secondary text-sm">
                    No topics found{debouncedSearch ? ` matching "${debouncedSearch}"` : ''}.
                  </div>
                ) : (
                  filteredTopics.map((topic, i) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <TopicCard topic={topic} />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Account Summary Card (for URL analysis result)
// ---------------------------------------------------------------------------

function AccountSummaryCard({
  account,
  onSave,
  onDismiss,
}: {
  account: DiscoverAccount
  onSave: (id: string, list: ListKey) => void
  onDismiss: () => void
}) {
  const [saveOpen, setSaveOpen] = useState(false)

  return (
    <div className="rounded-lg bg-background border border-accent/30 p-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: account.avatarColor }}
        >
          {account.initial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-text-primary">@{account.username}</span>
            <span className="text-text-secondary text-sm">{account.displayName}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-secondary mb-2">
            <span>{formatNumber(account.followers)} followers</span>
            <span>{account.engagementRate}% engagement</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {account.contentTags.map(tag => (
              <span key={tag} className="text-xs rounded-full bg-surface border border-border px-2 py-0.5 text-text-secondary">
                {tag}
              </span>
            ))}
          </div>

          {/* Score Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 font-semibold border', getScoreBadgeClasses(account.relevanceScore))}>
              Relevance: {account.relevanceScore}
            </span>
            <span className={cn('inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 font-semibold border', getScoreBadgeClasses(account.opportunityScore))}>
              Opportunity: {account.opportunityScore}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5 font-semibold border',
              account.collaborationPotential === 'High' ? 'bg-success/10 text-success border-success/30' :
              account.collaborationPotential === 'Medium' ? 'bg-warning/10 text-warning border-warning/30' :
              'bg-danger/10 text-danger border-danger/30'
            )}>
              Collab: {account.collaborationPotential}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSaveOpen(!saveOpen)}
                className="flex items-center gap-1.5 rounded-lg bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Save to List
                <ChevronDown className={cn('h-3 w-3 transition-transform', saveOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {saveOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 w-48 rounded-lg bg-surface border border-border shadow-lg z-10 py-1"
                  >
                    {(Object.keys(LIST_META) as ListKey[]).map(key => {
                      const meta = LIST_META[key]
                      const Icon = meta.icon
                      return (
                        <button
                          key={key}
                          onClick={() => { onSave(account.id, key); setSaveOpen(false) }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-background/50 transition-colors"
                        >
                          <Icon className={cn('h-3.5 w-3.5', meta.color)} />
                          {meta.label}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              href={`https://instagram.com/${account.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Profile
            </a>
            <button
              onClick={onDismiss}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-danger hover:border-danger/30 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Account Card (for grid results)
// ---------------------------------------------------------------------------

function AccountCard({
  account,
  savedLists,
  onSave,
  onRemove,
  onDismiss,
}: {
  account: DiscoverAccount
  savedLists: Record<ListKey, string[]>
  onSave: (id: string, list: ListKey) => void
  onRemove: (id: string, list: ListKey) => void
  onDismiss: (id: string) => void
}) {
  const [saveOpen, setSaveOpen] = useState(false)

  // Determine which lists this account is in
  const inLists = (Object.keys(savedLists) as ListKey[]).filter(k => savedLists[k].includes(account.id))

  return (
    <div className="hover-card p-4 group">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: account.avatarColor }}
        >
          {account.initial}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="min-w-0">
              <span className="font-semibold text-sm text-text-primary block truncate">@{account.username}</span>
              <span className="text-xs text-text-secondary">{account.displayName}</span>
            </div>
            <button
              onClick={() => onDismiss(account.id)}
              className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-danger transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-text-secondary mb-2">
            <span>{formatNumber(account.followers)} followers</span>
            <span>{account.engagementRate}% eng.</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {account.contentTags.map(tag => (
              <span key={tag} className="text-[10px] rounded-full bg-surface border border-border px-1.5 py-0.5 text-text-secondary">
                {tag}
              </span>
            ))}
          </div>

          {/* Scores */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className={cn('text-[10px] rounded-full px-2 py-0.5 font-semibold border', getScoreBadgeClasses(account.relevanceScore))}>
              Rel: {account.relevanceScore}
            </span>
            <span className={cn('text-[10px] rounded-full px-2 py-0.5 font-semibold border', getScoreBadgeClasses(account.opportunityScore))}>
              Opp: {account.opportunityScore}
            </span>
            <span className={cn(
              'text-[10px] rounded-full px-2 py-0.5 font-semibold border',
              account.collaborationPotential === 'High' ? 'bg-success/10 text-success border-success/30' :
              account.collaborationPotential === 'Medium' ? 'bg-warning/10 text-warning border-warning/30' :
              'bg-danger/10 text-danger border-danger/30'
            )}>
              Collab: {account.collaborationPotential}
            </span>
          </div>

          {/* In Lists indicator */}
          {inLists.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {inLists.map(key => {
                const meta = LIST_META[key]
                return (
                  <button
                    key={key}
                    onClick={() => onRemove(account.id, key)}
                    className={cn('text-[10px] rounded-full px-1.5 py-0.5 flex items-center gap-1 bg-surface border border-border text-text-secondary hover:border-danger/30 hover:text-danger transition-colors')}
                    title={`Remove from ${meta.label}`}
                  >
                    <X className="h-2.5 w-2.5" />
                    {meta.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setSaveOpen(!saveOpen)}
                className="flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent hover:bg-accent/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
                Save
                <ChevronDown className={cn('h-2.5 w-2.5 transition-transform', saveOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {saveOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 mt-1 w-44 rounded-lg bg-surface border border-border shadow-lg z-10 py-1"
                  >
                    {(Object.keys(LIST_META) as ListKey[]).map(key => {
                      const meta = LIST_META[key]
                      const Icon = meta.icon
                      const isIn = savedLists[key].includes(account.id)
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            if (isIn) onRemove(account.id, key)
                            else onSave(account.id, key)
                            setSaveOpen(false)
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                            isIn ? 'text-accent bg-accent/5' : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
                          )}
                        >
                          <Icon className={cn('h-3 w-3', meta.color)} />
                          {meta.label}
                          {isIn && <span className="ml-auto text-accent text-[10px]">Added</span>}
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              href={`https://instagram.com/${account.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hashtag Card
// ---------------------------------------------------------------------------

function HashtagCard({ hashtag }: { hashtag: DiscoverHashtag }) {
  return (
    <div className="hover-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Hash className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="font-semibold text-sm text-text-primary">{hashtag.tag}</p>
          <p className="text-xs text-text-secondary">{formatNumber(hashtag.postCount)} posts</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-xs rounded-full px-2.5 py-0.5 font-semibold border', getScoreBadgeClasses(hashtag.relevanceScore))}>
          Relevance: {hashtag.relevanceScore}
        </span>
        <button className="text-xs text-accent hover:underline flex items-center gap-1">
          <Bookmark className="h-3 w-3" />
          Save
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Topic Card
// ---------------------------------------------------------------------------

function TopicCard({ topic }: { topic: DiscoverTopic }) {
  return (
    <div className="hover-card p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-purple-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-text-primary truncate">{topic.topic}</p>
          <p className="text-xs text-text-secondary">{topic.source}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn('text-xs rounded-full px-2.5 py-0.5 font-semibold border', getScoreBadgeClasses(topic.momentumScore))}>
          Momentum: {topic.momentumScore}
        </span>
        <div className="flex items-center gap-1 text-xs">
          <Zap className="h-3 w-3 text-warning" />
          <span className="text-text-secondary">Trending</span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Analysis Skeleton
// ---------------------------------------------------------------------------

function AnalysisSkeleton() {
  return (
    <div className="rounded-lg bg-background border border-border p-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-surface" />
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-4 w-28 rounded bg-surface" />
            <div className="h-4 w-20 rounded bg-surface" />
          </div>
          <div className="flex gap-3">
            <div className="h-3 w-24 rounded bg-surface" />
            <div className="h-3 w-20 rounded bg-surface" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-surface" />
            <div className="h-5 w-16 rounded-full bg-surface" />
            <div className="h-5 w-20 rounded-full bg-surface" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-24 rounded-full bg-surface" />
            <div className="h-5 w-24 rounded-full bg-surface" />
            <div className="h-5 w-20 rounded-full bg-surface" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-24 rounded-lg bg-surface" />
            <div className="h-7 w-24 rounded-lg bg-surface" />
            <div className="h-7 w-20 rounded-lg bg-surface" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScoreBadgeClasses(score: number): string {
  if (score >= 70) return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
  if (score >= 40) return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
  return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
}
