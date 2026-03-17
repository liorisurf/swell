'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Waves, ArrowRight, ArrowLeft, Loader2, Check, Sparkles } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { INTEREST_CATEGORIES, CONTENT_STYLES, PRIMARY_GOALS, CATEGORY_ICONS } from '@/lib/constants'

const TOTAL_STEPS = 7

export default function OnboardingPage() {
  const router = useRouter()
  const { onboarding, updateOnboarding, user, setUser, setWorkspace } = useAppStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [generatingStrategy, setGeneratingStrategy] = useState(false)

  const canProceed = () => {
    switch (step) {
      case 1: return onboarding.workspaceName.trim().length > 0
      case 2: return true // Instagram username is optional
      case 3: return onboarding.categories.length > 0
      case 4: return true // Sub-interests optional
      case 5: return onboarding.targetAudience.trim().length > 0
      case 6: return onboarding.primaryGoal.length > 0
      case 7: return true
      default: return false
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const toggleCategory = (cat: string) => {
    const current = onboarding.categories
    if (current.includes(cat)) {
      updateOnboarding({ categories: current.filter((c) => c !== cat) })
    } else {
      updateOnboarding({ categories: [...current, cat] })
    }
  }

  const toggleContentStyle = (style: string) => {
    const current = onboarding.contentStyles
    if (current.includes(style)) {
      updateOnboarding({ contentStyles: current.filter((s) => s !== style) })
    } else {
      updateOnboarding({ contentStyles: [...current, style] })
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setGeneratingStrategy(true)

    try {
      // Create workspace
      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name: onboarding.workspaceName,
          owner_id: user!.id,
          instagram_username: onboarding.instagramUsername || null,
          primary_goal: onboarding.primaryGoal,
          target_audience: onboarding.targetAudience,
          content_styles: onboarding.contentStyles,
        })
        .select()
        .single()

      if (wsError) throw wsError

      // Create workspace member
      await supabase.from('workspace_members').insert({
        workspace_id: ws.id,
        user_id: user!.id,
        role: 'owner',
      })

      // Create user interests
      for (const category of onboarding.categories) {
        await supabase.from('user_interests').insert({
          workspace_id: ws.id,
          category,
          sub_interests: onboarding.subInterests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        })
      }

      // Generate growth strategy via AI
      const strategyRes = await fetch('/api/ai/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: ws.id,
          categories: onboarding.categories,
          sub_interests: onboarding.subInterests,
          target_audience: onboarding.targetAudience,
          content_styles: onboarding.contentStyles,
          primary_goal: onboarding.primaryGoal,
          instagram_username: onboarding.instagramUsername,
        }),
      })

      if (strategyRes.ok) {
        const strategy = await strategyRes.json()
        await supabase.from('growth_strategies').insert({
          workspace_id: ws.id,
          ...strategy,
          is_active: true,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }

      // Mark onboarding complete
      await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user!.id)

      setUser({ ...user!, onboarding_completed: true })
      setWorkspace(ws as any)
      router.push('/dashboard')
    } catch (err) {
      console.error('Onboarding error:', err)
    } finally {
      setLoading(false)
      setGeneratingStrategy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="h-7 w-7 text-accent" />
          <span className="text-xl font-bold gradient-text">SWELL</span>
        </div>
        <span className="text-sm text-text-secondary">Step {step} of {TOTAL_STEPS}</span>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-surface h-1">
        <motion.div
          className="h-1 bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step 1: Workspace Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Name your workspace</h2>
                    <p className="text-text-secondary">This could be your brand name, your name, or anything you like.</p>
                  </div>
                  <input
                    type="text"
                    value={onboarding.workspaceName}
                    onChange={(e) => updateOnboarding({ workspaceName: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface px-5 py-4 text-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                    placeholder="e.g. My Surf Brand, @yourname"
                    autoFocus
                  />
                </div>
              )}

              {/* Step 2: Instagram Username */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Your Instagram username</h2>
                    <p className="text-text-secondary">Optional — we&apos;ll use this to analyze your profile and personalize recommendations.</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary text-lg">@</span>
                    <input
                      type="text"
                      value={onboarding.instagramUsername}
                      onChange={(e) => updateOnboarding({ instagramUsername: e.target.value.replace('@', '') })}
                      className="w-full rounded-xl border border-border bg-surface pl-10 pr-5 py-4 text-lg text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
                      placeholder="username"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-text-secondary">
                    We never access your account. We only look at publicly available profile info.
                  </p>
                </div>
              )}

              {/* Step 3: Interest Categories */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Define your world</h2>
                    <p className="text-text-secondary">Pick the categories that define your niche. Select as many as you want.</p>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-2">
                    {INTEREST_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                          onboarding.categories.includes(cat)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-surface text-text-secondary hover:border-accent/30 hover:text-text-primary'
                        }`}
                      >
                        <span>{CATEGORY_ICONS[cat] || '🏷️'}</span>
                        <span className="truncate">{cat}</span>
                      </button>
                    ))}
                  </div>
                  {onboarding.categories.length > 0 && (
                    <p className="text-sm text-accent">
                      {onboarding.categories.length} selected
                    </p>
                  )}
                </div>
              )}

              {/* Step 4: Sub-interests */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Get specific</h2>
                    <p className="text-text-secondary">
                      Add any keywords, brands, communities, or topics that define your niche even further.
                    </p>
                  </div>
                  <textarea
                    value={onboarding.subInterests}
                    onChange={(e) => updateOnboarding({ subInterests: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface px-5 py-4 text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors min-h-[140px] resize-none"
                    placeholder="e.g. longboard surf, film photography, 35mm, vintage vans, Japanese denim, slow travel"
                    autoFocus
                  />
                  <p className="text-xs text-text-secondary">Separate items with commas. The more specific, the better SWELL works for you.</p>
                </div>
              )}

              {/* Step 5: Target Audience */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Who do you want to reach?</h2>
                    <p className="text-text-secondary">Describe your ideal audience. Be as specific as possible.</p>
                  </div>
                  <textarea
                    value={onboarding.targetAudience}
                    onChange={(e) => updateOnboarding({ targetAudience: e.target.value })}
                    className="w-full rounded-xl border border-border bg-surface px-5 py-4 text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors min-h-[140px] resize-none"
                    placeholder="e.g. 18-30 year olds who surf, travel, and care about sustainability. Based in Europe and Australia."
                    autoFocus
                  />
                </div>
              )}

              {/* Step 6: Content Style + Goal */}
              {step === 6 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">Your content style</h2>
                    <p className="text-text-secondary">How do you create content? Pick one or more styles.</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CONTENT_STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => toggleContentStyle(style)}
                        className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                          onboarding.contentStyles.includes(style)
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-surface text-text-secondary hover:border-accent/30 hover:text-text-primary'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">Primary goal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRIMARY_GOALS.map((goal) => (
                        <button
                          key={goal}
                          onClick={() => updateOnboarding({ primaryGoal: goal })}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium text-left transition-all ${
                            onboarding.primaryGoal === goal
                              ? 'border-accent bg-accent/10 text-accent'
                              : 'border-border bg-surface text-text-secondary hover:border-accent/30 hover:text-text-primary'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Summary + Generate */}
              {step === 7 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary mb-2">
                      {generatingStrategy ? 'Building your strategy...' : "You're all set!"}
                    </h2>
                    <p className="text-text-secondary">
                      {generatingStrategy
                        ? 'SWELL is creating your personalized growth strategy with AI.'
                        : 'Review your setup and let SWELL generate your personalized Growth Strategy.'}
                    </p>
                  </div>

                  {generatingStrategy ? (
                    <div className="glass-card p-8 flex flex-col items-center gap-4">
                      <div className="relative">
                        <Sparkles className="h-12 w-12 text-accent animate-pulse-soft" />
                      </div>
                      <p className="text-sm text-text-secondary animate-pulse">Analyzing your niche and generating recommendations...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <SummaryRow label="Workspace" value={onboarding.workspaceName} />
                      {onboarding.instagramUsername && (
                        <SummaryRow label="Instagram" value={`@${onboarding.instagramUsername}`} />
                      )}
                      <SummaryRow label="Categories" value={onboarding.categories.join(', ')} />
                      {onboarding.subInterests && (
                        <SummaryRow label="Sub-interests" value={onboarding.subInterests} />
                      )}
                      <SummaryRow label="Target audience" value={onboarding.targetAudience} />
                      <SummaryRow label="Content styles" value={onboarding.contentStyles.join(', ')} />
                      <SummaryRow label="Primary goal" value={onboarding.primaryGoal} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="border-t border-border/50 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Generate My Strategy
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card px-4 py-3 flex items-start gap-3">
      <span className="text-sm text-text-secondary min-w-[120px]">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  )
}
