'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FlaskConical,
  Calendar,
  Target,
  ChevronDown,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

type ExperimentStatus = 'planned' | 'running' | 'completed' | 'abandoned'

interface Experiment {
  id: string
  title: string
  hypothesis: string
  successMetric: string
  duration: string
  status: ExperimentStatus
  createdAt: string
  startedAt?: string
  completedAt?: string
  results?: string
  aiSummary?: string
}

const statusConfig: Record<ExperimentStatus, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  planned: { label: 'Planned', color: 'text-text-secondary', bgColor: 'bg-text-secondary/10 border-text-secondary/20', icon: Clock },
  running: { label: 'Running', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/20', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-success', bgColor: 'bg-success/10 border-success/20', icon: CheckCircle2 },
  abandoned: { label: 'Abandoned', color: 'text-danger', bgColor: 'bg-danger/10 border-danger/20', icon: XCircle },
}

const demoExperiments: Experiment[] = [
  {
    id: '1',
    title: 'Reel-first posting for 2 weeks',
    hypothesis: 'Posting 4 Reels per week instead of 2 will increase reach by at least 40% and follower growth by 20%.',
    successMetric: 'Average reach per post > 8,000 and net follower gain > 200',
    duration: '14 days',
    status: 'completed',
    createdAt: '2024-02-15',
    startedAt: '2024-02-16',
    completedAt: '2024-03-01',
    results: 'Reach increased 52%. Gained 280 followers. Engagement dipped slightly on day 10 due to lower quality, recovered after adjusting.',
    aiSummary: 'The experiment exceeded its success criteria. Reach increased by 52% (target: 40%) and net followers grew by 280 (target: 200). The mid-experiment quality dip suggests 4 Reels/week may be near the sustainable limit. Recommendation: maintain 3-4 Reels per week but batch-produce to maintain quality consistency.',
  },
  {
    id: '2',
    title: 'Hashtag strategy overhaul',
    hypothesis: 'Switching from broad hashtags (1M+ posts) to mid-range niche hashtags (50K-500K) will improve discoverability and reach by 25%.',
    successMetric: 'Hashtag-driven reach > 30% of total reach',
    duration: '21 days',
    status: 'running',
    createdAt: '2024-03-05',
    startedAt: '2024-03-06',
    results: 'Day 8: Hashtag reach now 22% of total, up from 11%. Seeing more explore page appearances.',
  },
  {
    id: '3',
    title: 'Engagement pod participation',
    hypothesis: 'Joining a 15-person engagement pod will boost initial engagement velocity and trigger algorithm distribution.',
    successMetric: 'First-hour engagement rate > 5% on pod-boosted posts',
    duration: '30 days',
    status: 'abandoned',
    createdAt: '2024-02-20',
    startedAt: '2024-02-21',
    completedAt: '2024-03-02',
    results: 'Abandoned after 10 days. First-hour engagement spiked but algorithmic reach actually decreased. Instagram may detect inorganic patterns.',
    aiSummary: 'Engagement pod participation produced artificially inflated metrics but degraded organic distribution. The algorithm likely identified inorganic engagement patterns, resulting in reduced explore page visibility. This approach is not recommended.',
  },
  {
    id: '4',
    title: 'Story polls for content direction',
    hypothesis: 'Using daily story polls to let the audience choose next content topics will increase story engagement by 35% and feed engagement by 15%.',
    successMetric: 'Story reply rate > 8% and feed engagement > 4.2%',
    duration: '14 days',
    status: 'planned',
    createdAt: '2024-03-12',
  },
]

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>(demoExperiments)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ title: '', hypothesis: '', successMetric: '', duration: '' })
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null)
  const [resultInputs, setResultInputs] = useState<Record<string, string>>({})

  const handleCreateExperiment = () => {
    if (!formData.title.trim() || !formData.hypothesis.trim()) return

    const newExperiment: Experiment = {
      id: Date.now().toString(),
      title: formData.title,
      hypothesis: formData.hypothesis,
      successMetric: formData.successMetric,
      duration: formData.duration || '14 days',
      status: 'planned',
      createdAt: new Date().toISOString().split('T')[0],
    }

    setExperiments([newExperiment, ...experiments])
    setFormData({ title: '', hypothesis: '', successMetric: '', duration: '' })
    setShowForm(false)
  }

  const updateStatus = (id: string, newStatus: ExperimentStatus) => {
    setExperiments((prev) =>
      prev.map((exp) => {
        if (exp.id !== id) return exp
        const updates: Partial<Experiment> = { status: newStatus }
        if (newStatus === 'running' && !exp.startedAt) {
          updates.startedAt = new Date().toISOString().split('T')[0]
        }
        if (newStatus === 'completed' || newStatus === 'abandoned') {
          updates.completedAt = new Date().toISOString().split('T')[0]
        }
        return { ...exp, ...updates }
      })
    )
    setOpenStatusDropdown(null)
  }

  const logResult = (id: string) => {
    const text = resultInputs[id]?.trim()
    if (!text) return

    setExperiments((prev) =>
      prev.map((exp) => {
        if (exp.id !== id) return exp
        const existingResults = exp.results ? exp.results + '\n' : ''
        return { ...exp, results: existingResults + text }
      })
    )
    setResultInputs((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Experiments</h1>
            <p className="text-text-secondary">
              Test hypotheses, track results, and learn what works for your account.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'New Experiment'}
          </button>
        </motion.div>

        {/* New Experiment Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-accent/30 bg-surface p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                  <FlaskConical className="h-5 w-5 text-accent" />
                  New Experiment
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Reel-first posting for 2 weeks"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Hypothesis</label>
                    <textarea
                      value={formData.hypothesis}
                      onChange={(e) => setFormData({ ...formData, hypothesis: e.target.value })}
                      placeholder="What do you believe will happen and why?"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">Success Metric</label>
                      <input
                        type="text"
                        value={formData.successMetric}
                        onChange={(e) => setFormData({ ...formData, successMetric: e.target.value })}
                        placeholder="e.g., Reach > 8,000 per post"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-text-secondary">Duration</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 14 days"
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCreateExperiment}
                      disabled={!formData.title.trim() || !formData.hypothesis.trim()}
                      className="rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Create Experiment
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Experiments List */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {experiments.map((exp) => {
            const config = statusConfig[exp.status]
            const StatusIcon = config.icon

            return (
              <motion.div
                key={exp.id}
                variants={fadeInUp}
                layout
                className="hover-card rounded-xl border border-border bg-surface p-6"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary">{exp.title}</h3>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenStatusDropdown(openStatusDropdown === exp.id ? null : exp.id)
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        config.bgColor,
                        config.color
                      )}
                    >
                      <StatusIcon className={cn('h-3.5 w-3.5', exp.status === 'running' && 'animate-spin')} />
                      {config.label}
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    {/* Status Dropdown */}
                    <AnimatePresence>
                      {openStatusDropdown === exp.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-border bg-surface py-1 shadow-lg"
                        >
                          {(Object.entries(statusConfig) as [ExperimentStatus, typeof config][]).map(
                            ([status, cfg]) => (
                              <button
                                key={status}
                                onClick={() => updateStatus(exp.id, status)}
                                className={cn(
                                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-background',
                                  exp.status === status ? cfg.color : 'text-text-secondary'
                                )}
                              >
                                {cfg.label}
                              </button>
                            )
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Hypothesis</p>
                      <p className="mt-0.5 text-sm text-text-primary">{exp.hypothesis}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Target className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Success Metric</p>
                      <p className="mt-0.5 text-sm text-text-primary">{exp.successMetric}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Created: {exp.createdAt}
                    </span>
                    {exp.startedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Started: {exp.startedAt}
                      </span>
                    )}
                    {exp.completedAt && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Ended: {exp.completedAt}
                      </span>
                    )}
                    <span>Duration: {exp.duration}</span>
                  </div>
                </div>

                {/* Results (for running experiments) */}
                {exp.status === 'running' && (
                  <div className="mt-4 border-t border-border pt-4">
                    {exp.results && (
                      <div className="mb-3 rounded-lg bg-background p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Results Log</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{exp.results}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={resultInputs[exp.id] || ''}
                        onChange={(e) =>
                          setResultInputs((prev) => ({ ...prev, [exp.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && logResult(exp.id)}
                        placeholder="Log a result or observation..."
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                      <button
                        onClick={() => logResult(exp.id)}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                      >
                        Log
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed results and AI summary */}
                {(exp.status === 'completed' || exp.status === 'abandoned') && exp.results && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Results</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-text-primary">{exp.results}</p>
                    </div>
                    {exp.aiSummary && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-accent">
                          <Sparkles className="h-3.5 w-3.5" />
                          AI Summary
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-text-primary">{exp.aiSummary}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {experiments.length === 0 && (
          <motion.div
            {...fadeInUp}
            className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16"
          >
            <FlaskConical className="h-12 w-12 text-text-secondary/30" />
            <p className="mt-4 text-lg text-text-secondary">No experiments yet</p>
            <p className="mt-1 text-sm text-text-secondary/70">
              Create your first experiment to start testing growth strategies.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
