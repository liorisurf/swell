'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Zap,
  Play,
  Square,
  Hash,
  Users,
  Heart,
  UserPlus,
  Clock,
  Shield,
  AlertTriangle,
  Settings,
  Terminal,
  Copy,
  Check,
  Trash2,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
}

interface AutomationConfig {
  igUsername: string
  igPassword: string
  maxLikesPerDay: number
  maxFollowsPerDay: number
  targetHashtags: string
  targetAccounts: string
  minDelay: number
  maxDelay: number
}

interface ActivityLogEntry {
  id: string
  timestamp: string
  type: 'like' | 'follow' | 'error' | 'info'
  message: string
}

const STORAGE_KEY = 'swell_automation_config'
const LOG_STORAGE_KEY = 'swell_automation_log'

const defaultConfig: AutomationConfig = {
  igUsername: '',
  igPassword: '',
  maxLikesPerDay: 20,
  maxFollowsPerDay: 10,
  targetHashtags: '',
  targetAccounts: '',
  minDelay: 30,
  maxDelay: 120,
}

export default function AutomationPage() {
  const [config, setConfig] = useState<AutomationConfig>(defaultConfig)
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [activeTab, setActiveTab] = useState<'settings' | 'log' | 'setup'>('settings')
  const [saved, setSaved] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setConfig(JSON.parse(stored))
      } catch {}
    }
    const storedLog = localStorage.getItem(LOG_STORAGE_KEY)
    if (storedLog) {
      try {
        setActivityLog(JSON.parse(storedLog))
      } catch {}
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearLog = () => {
    setActivityLog([])
    localStorage.removeItem(LOG_STORAGE_KEY)
  }

  const updateConfig = (key: keyof AutomationConfig, value: string | number) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCommand(id)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const generateEnvContent = () => {
    return `IG_USERNAME=${config.igUsername}
IG_PASSWORD=${config.igPassword}
MAX_LIKES_PER_DAY=${config.maxLikesPerDay}
MAX_FOLLOWS_PER_DAY=${config.maxFollowsPerDay}
TARGET_HASHTAGS=${config.targetHashtags}
TARGET_ACCOUNTS=${config.targetAccounts}
MIN_DELAY=${config.minDelay}
MAX_DELAY=${config.maxDelay}`
  }

  const tabs = [
    { id: 'settings' as const, label: 'Settings', icon: Settings },
    { id: 'setup' as const, label: 'Setup & Run', icon: Terminal },
    { id: 'log' as const, label: 'Activity Log', icon: Activity },
  ]

  const logTypeConfig = {
    like: { color: 'text-pink-400', icon: Heart, bg: 'bg-pink-400/10' },
    follow: { color: 'text-blue-400', icon: UserPlus, bg: 'bg-blue-400/10' },
    error: { color: 'text-danger', icon: AlertTriangle, bg: 'bg-danger/10' },
    info: { color: 'text-accent', icon: Zap, bg: 'bg-accent/10' },
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <motion.div {...fadeInUp}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Automation</h1>
              <p className="text-text-secondary">
                Configure and run your Instagram automation bot locally.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Risk Warning */}
        <motion.div
          {...fadeInUp}
          className="rounded-xl border border-warning/30 bg-warning/5 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
            <div>
              <h3 className="font-semibold text-warning">Important Risks & Disclaimers</h3>
              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                <li>
                  Automating likes and follows violates Instagram's Terms of Service and may result in
                  account suspension or permanent ban.
                </li>
                <li>
                  Use conservative daily limits and human-like delays to reduce detection risk.
                </li>
                <li>
                  Your credentials are stored locally only and never sent to any server.
                </li>
                <li>
                  The bot runs entirely on your machine via Playwright. No cloud services involved.
                </li>
                <li>
                  Start with very low limits (5-10 actions) and gradually increase over weeks.
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div {...fadeInUp} className="flex gap-1 rounded-lg bg-surface p-1">
          {tabs.map((tab) => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background'
                )}
              >
                <TabIcon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Credentials */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <Shield className="h-5 w-5 text-accent" />
                Instagram Credentials
              </h3>
              <p className="mb-4 text-xs text-text-secondary">
                Stored in your browser's localStorage only. Never sent anywhere.
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Username
                  </label>
                  <input
                    type="text"
                    value={config.igUsername}
                    onChange={(e) => updateConfig('igUsername', e.target.value)}
                    placeholder="your_username"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Password
                  </label>
                  <input
                    type="password"
                    value={config.igPassword}
                    onChange={(e) => updateConfig('igPassword', e.target.value)}
                    placeholder="********"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Daily Limits */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <Shield className="h-5 w-5 text-success" />
                Daily Limits
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <Heart className="h-3.5 w-3.5 text-pink-400" />
                    Max Likes Per Day
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={config.maxLikesPerDay}
                    onChange={(e) =>
                      updateConfig('maxLikesPerDay', parseInt(e.target.value) || 20)
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="mt-1 text-xs text-text-secondary/70">
                    Recommended: 10-30 per day
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <UserPlus className="h-3.5 w-3.5 text-blue-400" />
                    Max Follows Per Day
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={config.maxFollowsPerDay}
                    onChange={(e) =>
                      updateConfig('maxFollowsPerDay', parseInt(e.target.value) || 10)
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="mt-1 text-xs text-text-secondary/70">
                    Recommended: 5-15 per day
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Targets */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <Zap className="h-5 w-5 text-accent" />
                Targets
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <Hash className="h-3.5 w-3.5 text-accent" />
                    Target Hashtags
                  </label>
                  <input
                    type="text"
                    value={config.targetHashtags}
                    onChange={(e) => updateConfig('targetHashtags', e.target.value)}
                    placeholder="surfing, waves, oceanlife, sunset"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="mt-1 text-xs text-text-secondary/70">
                    Comma-separated hashtags (without #). Bot will like recent posts with these tags.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <Users className="h-3.5 w-3.5 text-accent" />
                    Target Accounts
                  </label>
                  <input
                    type="text"
                    value={config.targetAccounts}
                    onChange={(e) => updateConfig('targetAccounts', e.target.value)}
                    placeholder="natgeo, surfline, thesearch"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="mt-1 text-xs text-text-secondary/70">
                    Comma-separated usernames. Bot will follow their recent followers.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Delay Settings */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <Clock className="h-5 w-5 text-accent" />
                Delay Between Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Minimum Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={config.minDelay}
                    onChange={(e) =>
                      updateConfig('minDelay', parseInt(e.target.value) || 30)
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Maximum Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={600}
                    value={config.maxDelay}
                    onChange={(e) =>
                      updateConfig('maxDelay', parseInt(e.target.value) || 120)
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-text-secondary/70">
                Random delay between {config.minDelay}s and {config.maxDelay}s will be used between each action to mimic human behavior.
              </p>
            </motion.div>

            {/* Save Button */}
            <motion.div variants={fadeInUp} className="flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 font-medium text-white transition-colors hover:bg-accent-hover"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Setup & Run Tab */}
        {activeTab === 'setup' && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6"
          >
            {/* Step 1 */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  1
                </span>
                Generate .env File
              </h3>
              <p className="mb-3 text-sm text-text-secondary">
                Save your settings first, then copy this content into{' '}
                <code className="rounded bg-background px-1.5 py-0.5 text-accent">
                  automation/.env
                </code>
              </p>
              <div className="relative">
                <pre className="rounded-lg bg-background p-4 text-sm text-text-primary overflow-x-auto">
                  {generateEnvContent()}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateEnvContent(), 'env')}
                  className="absolute right-2 top-2 rounded-md bg-surface p-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {copiedCommand === 'env' ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  2
                </span>
                Install Dependencies
              </h3>
              <p className="mb-3 text-sm text-text-secondary">
                Open a terminal in the project root and run:
              </p>
              <div className="space-y-3">
                {[
                  { id: 'install-deps', cmd: 'cd automation && npm install playwright dotenv' },
                  { id: 'install-pw', cmd: 'npx playwright install chromium' },
                ].map((item) => (
                  <div key={item.id} className="relative">
                    <pre className="rounded-lg bg-background p-4 pr-12 text-sm text-text-primary">
                      {item.cmd}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(item.cmd, item.id)}
                      className="absolute right-2 top-2 rounded-md bg-surface p-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {copiedCommand === item.id ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  3
                </span>
                Run the Bot
              </h3>
              <p className="mb-3 text-sm text-text-secondary">
                Run the bot using one of these methods:
              </p>
              <div className="space-y-3">
                {[
                  {
                    id: 'run-bat',
                    label: 'Option A: Double-click',
                    cmd: 'automation\\start.bat',
                  },
                  {
                    id: 'run-node',
                    label: 'Option B: Terminal',
                    cmd: 'cd automation && node bot.mjs',
                  },
                ].map((item) => (
                  <div key={item.id}>
                    <p className="mb-1 text-xs font-medium text-text-secondary">{item.label}</p>
                    <div className="relative">
                      <pre className="rounded-lg bg-background p-4 pr-12 text-sm text-text-primary">
                        {item.cmd}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(item.cmd, item.id)}
                        className="absolute right-2 top-2 rounded-md bg-surface p-2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {copiedCommand === item.id ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step 4 - Stop */}
            <motion.div
              variants={fadeInUp}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-text-primary">
                <Square className="h-5 w-5 text-danger" />
                Stopping the Bot
              </h3>
              <p className="text-sm text-text-secondary">
                Press{' '}
                <code className="rounded bg-background px-1.5 py-0.5 text-accent">Ctrl + C</code>{' '}
                in the terminal window to stop the bot at any time. It will gracefully shut down
                after completing the current action.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'log' && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                {activityLog.length} entries
              </p>
              {activityLog.length > 0 && (
                <button
                  onClick={handleClearLog}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear Log
                </button>
              )}
            </motion.div>

            {activityLog.length > 0 ? (
              <motion.div variants={fadeInUp} className="space-y-2">
                {activityLog.map((entry) => {
                  const typeConf = logTypeConfig[entry.type]
                  const LogIcon = typeConf.icon
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 rounded-lg border border-border bg-surface p-3"
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
                          typeConf.bg
                        )}
                      >
                        <LogIcon className={cn('h-3.5 w-3.5', typeConf.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">{entry.message}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{entry.timestamp}</p>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            ) : (
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16"
              >
                <Activity className="h-12 w-12 text-text-secondary/30" />
                <p className="mt-4 text-lg text-text-secondary">No activity yet</p>
                <p className="mt-1 text-sm text-text-secondary/70">
                  Activity will appear here once you run the bot.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
