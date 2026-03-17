'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Send,
  Copy,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  X,
  User,
  Users,
  MessageSquare,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Clock,
} from 'lucide-react'
import { cn, formatNumber, getScoreBgColor } from '@/lib/utils'

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

type OutreachStatus = 'identified' | 'draft_ready' | 'sent' | 'replied' | 'closed' | 'not_interested'

interface OutreachTarget {
  id: string
  username: string
  followerCount: number
  collaborationScore: number
  status: OutreachStatus
  notes: string
  dmDraft?: string
  isGeneratingDraft?: boolean
  lastUpdated: string
}

const statusConfig: Record<OutreachStatus, { label: string; color: string; bgColor: string }> = {
  identified: { label: 'Identified', color: 'text-text-secondary', bgColor: 'bg-text-secondary/10 border-text-secondary/20' },
  draft_ready: { label: 'Draft Ready', color: 'text-accent', bgColor: 'bg-accent/10 border-accent/20' },
  sent: { label: 'Sent', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/20' },
  replied: { label: 'Replied', color: 'text-success', bgColor: 'bg-success/10 border-success/20' },
  closed: { label: 'Closed', color: 'text-success', bgColor: 'bg-success/10 border-success/20' },
  not_interested: { label: 'Not Interested', color: 'text-danger', bgColor: 'bg-danger/10 border-danger/20' },
}

const statusOrder: OutreachStatus[] = ['identified', 'draft_ready', 'sent', 'replied', 'closed', 'not_interested']

const tabFilters = [
  { key: 'all', label: 'All' },
  { key: 'identified', label: 'Identified' },
  { key: 'draft_ready', label: 'Draft Ready' },
  { key: 'sent', label: 'Sent' },
  { key: 'replied', label: 'Replied' },
  { key: 'closed', label: 'Closed' },
] as const

type TabFilter = (typeof tabFilters)[number]['key']

const demoDraftMessages: Record<string, string> = {
  '1': `Hey @designbyemma! I've been following your work for a while and love how you approach minimalist brand identities. I noticed we both create for early-stage startups and our audiences overlap quite a bit.

I'd love to explore a collaboration idea: a joint carousel series where we each redesign the same fictional brand in our own style. I think both our audiences would find the contrast really engaging.

Would you be open to a quick chat about this? No pressure at all!`,
  '2': `Hi @motionmark! Your animation breakdowns are insane. The way you explain motion principles in 30-second Reels is really impressive.

I was thinking we could do something cool together: a "design-to-motion" collab where I create a static brand concept and you bring it to life with animation. We could each post from our own accounts and tag each other.

Let me know if this sounds interesting to you!`,
  '3': `Hello @thebrandstrategist! I really admire your content on positioning and brand strategy. Your recent series on niche differentiation was spot on.

I think there's a natural overlap between our content: you focus on the strategic side and I focus on the visual execution. A collab could work well, maybe a live session or a carousel series showing strategy-to-design workflow.

Would love to hear your thoughts if you're interested!`,
}

const demoTargets: OutreachTarget[] = [
  {
    id: '1',
    username: 'designbyemma',
    followerCount: 32400,
    collaborationScore: 87,
    status: 'draft_ready',
    notes: 'Minimalist brand designer, strong carousel engagement',
    dmDraft: demoDraftMessages['1'],
    lastUpdated: '2024-03-14',
  },
  {
    id: '2',
    username: 'motionmark',
    followerCount: 18700,
    collaborationScore: 72,
    status: 'identified',
    notes: 'Motion designer, great Reels engagement, overlapping audience',
    lastUpdated: '2024-03-12',
  },
  {
    id: '3',
    username: 'thebrandstrategist',
    followerCount: 45200,
    collaborationScore: 91,
    status: 'sent',
    notes: 'Brand strategy content creator. DM sent on March 10.',
    dmDraft: demoDraftMessages['3'],
    lastUpdated: '2024-03-10',
  },
  {
    id: '4',
    username: 'ux.sarah',
    followerCount: 28100,
    collaborationScore: 65,
    status: 'replied',
    notes: 'UX designer. Interested in a joint IG Live on design systems.',
    dmDraft: 'Hey Sarah! Loved your recent post on design tokens...',
    lastUpdated: '2024-03-08',
  },
  {
    id: '5',
    username: 'type.nerd',
    followerCount: 12300,
    collaborationScore: 58,
    status: 'not_interested',
    notes: 'Typography focused. Politely declined, maybe revisit later.',
    lastUpdated: '2024-03-05',
  },
  {
    id: '6',
    username: 'startup.visual',
    followerCount: 51000,
    collaborationScore: 82,
    status: 'closed',
    notes: 'Collab completed. Joint carousel got 4.2K likes. Great partnership.',
    dmDraft: 'Collab completed successfully.',
    lastUpdated: '2024-02-28',
  },
]

export default function OutreachPage() {
  const [targets, setTargets] = useState<OutreachTarget[]>(demoTargets)
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormData, setAddFormData] = useState({ username: '', notes: '' })
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null)
  const [editingDraft, setEditingDraft] = useState<string | null>(null)
  const [draftEdits, setDraftEdits] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filteredTargets =
    activeTab === 'all'
      ? targets
      : targets.filter((t) => t.status === activeTab)

  const handleAddTarget = () => {
    if (!addFormData.username.trim()) return

    const newTarget: OutreachTarget = {
      id: Date.now().toString(),
      username: addFormData.username.replace(/^@/, ''),
      followerCount: Math.floor(Math.random() * 40000) + 5000,
      collaborationScore: Math.floor(Math.random() * 40) + 50,
      status: 'identified',
      notes: addFormData.notes,
      lastUpdated: new Date().toISOString().split('T')[0],
    }

    setTargets([newTarget, ...targets])
    setAddFormData({ username: '', notes: '' })
    setShowAddForm(false)
  }

  const updateStatus = (id: string, newStatus: OutreachStatus) => {
    setTargets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : t
      )
    )
    setOpenStatusDropdown(null)
  }

  const generateDraft = (id: string) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isGeneratingDraft: true } : t))
    )

    setTimeout(() => {
      const target = targets.find((t) => t.id === id)
      const draft = `Hey @${target?.username}! I've been following your content and really appreciate your approach. I think our audiences overlap quite a bit and there could be a great collab opportunity here.\n\nWould love to brainstorm some ideas if you're open to it. No pressure at all, just thought it could be mutually beneficial.\n\nLet me know what you think!`

      setTargets((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, dmDraft: draft, isGeneratingDraft: false, status: 'draft_ready', lastUpdated: new Date().toISOString().split('T')[0] }
            : t
        )
      )
    }, 2000)
  }

  const saveDraftEdit = (id: string) => {
    const editedText = draftEdits[id]
    if (editedText !== undefined) {
      setTargets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, dmDraft: editedText } : t))
      )
    }
    setEditingDraft(null)
  }

  const copyDraft = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: targets.length }
    targets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1
    })
    return counts
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Outreach Manager</h1>
              <p className="text-text-secondary">
                Manage collaboration targets and draft personalized DMs.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? 'Cancel' : 'Add Target'}
            </button>
          </div>

          {/* Safety Badge */}
          <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-4 py-2.5">
            <ShieldCheck className="h-5 w-5 shrink-0 text-accent" />
            <p className="text-sm text-text-secondary">
              <span className="font-medium text-accent">Never auto-sends.</span> All messages are drafted here.
              You copy and send manually from Instagram.
            </p>
          </div>
        </motion.div>

        {/* Add Target Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-accent/30 bg-surface p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <User className="h-5 w-5 text-accent" />
                  Add Outreach Target
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Username</label>
                    <input
                      type="text"
                      value={addFormData.username}
                      onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                      placeholder="@username"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Notes</label>
                    <textarea
                      value={addFormData.notes}
                      onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                      placeholder="Why this person? What kind of collaboration?"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddTarget}
                      disabled={!addFormData.username.trim()}
                      className="rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add Target
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Filters */}
        <motion.div {...fadeInUp} transition={{ delay: 0.05 }}>
          <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-surface p-1">
            {tabFilters.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {tab.label}
                {statusCounts[tab.key] !== undefined && (
                  <span className="ml-1.5 text-xs opacity-70">({statusCounts[tab.key] || 0})</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Target Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredTargets.map((target) => {
              const config = statusConfig[target.status]

              return (
                <motion.div
                  key={target.id}
                  variants={fadeInUp}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="hover-card rounded-xl border border-border bg-surface p-6"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                        <User className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-text-primary">@{target.username}</h3>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {formatNumber(target.followerCount)}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              getScoreBgColor(target.collaborationScore)
                            )}
                          >
                            Score: {target.collaborationScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenStatusDropdown(
                            openStatusDropdown === target.id ? null : target.id
                          )
                        }
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          config.bgColor,
                          config.color
                        )}
                      >
                        {config.label}
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      <AnimatePresence>
                        {openStatusDropdown === target.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-border bg-surface py-1 shadow-lg"
                          >
                            {statusOrder.map((status) => {
                              const cfg = statusConfig[status]
                              return (
                                <button
                                  key={status}
                                  onClick={() => updateStatus(target.id, status)}
                                  className={cn(
                                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-background',
                                    target.status === status ? cfg.color : 'text-text-secondary'
                                  )}
                                >
                                  {cfg.label}
                                </button>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Notes */}
                  {target.notes && (
                    <p className="mt-3 text-sm text-text-secondary">{target.notes}</p>
                  )}

                  {/* Last updated */}
                  <p className="mt-2 flex items-center gap-1 text-xs text-text-secondary/60">
                    <Clock className="h-3 w-3" />
                    Updated: {target.lastUpdated}
                  </p>

                  {/* DM Draft Section */}
                  {target.dmDraft && !target.isGeneratingDraft && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          <MessageSquare className="h-3.5 w-3.5" />
                          DM Draft
                        </p>
                        <div className="flex gap-2">
                          {editingDraft === target.id ? (
                            <button
                              onClick={() => saveDraftEdit(target.id)}
                              className="flex items-center gap-1 rounded-md border border-accent/30 px-2.5 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingDraft(target.id)
                                setDraftEdits((prev) => ({
                                  ...prev,
                                  [target.id]: target.dmDraft || '',
                                }))
                              }}
                              className="rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => copyDraft(target.id, target.dmDraft || '')}
                            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                          >
                            <Copy className="h-3 w-3" />
                            {copiedId === target.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {editingDraft === target.id ? (
                        <textarea
                          value={draftEdits[target.id] ?? target.dmDraft}
                          onChange={(e) =>
                            setDraftEdits((prev) => ({ ...prev, [target.id]: e.target.value }))
                          }
                          rows={6}
                          className="mt-2 w-full rounded-lg border border-accent/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      ) : (
                        <div className="mt-2 rounded-lg bg-background p-3">
                          <p className="whitespace-pre-line text-sm text-text-primary">
                            {target.dmDraft}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Generate Draft / Loading State */}
                  {target.isGeneratingDraft && (
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                      <Loader2 className="h-4 w-4 animate-spin text-accent" />
                      <p className="text-sm text-text-secondary">Generating personalized draft...</p>
                    </div>
                  )}

                  {!target.dmDraft && !target.isGeneratingDraft && target.status !== 'closed' && target.status !== 'not_interested' && (
                    <div className="mt-4 border-t border-border pt-4">
                      <button
                        onClick={() => generateDraft(target.id)}
                        className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate DM Draft
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredTargets.length === 0 && (
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16"
          >
            <Mail className="h-12 w-12 text-text-secondary/30" />
            <p className="mt-4 text-lg text-text-secondary">No targets in this view</p>
            <p className="mt-1 text-sm text-text-secondary/70">
              {activeTab === 'all'
                ? 'Add your first outreach target to get started.'
                : 'No targets with this status yet.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
