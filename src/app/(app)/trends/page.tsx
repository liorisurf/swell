'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Flame, ExternalLink, Calendar, Bookmark,
  FlaskConical, X, ChevronDown, Sparkles, Globe,
  Youtube, MessageSquare, Image, Music2,
} from 'lucide-react'
import { cn, getScoreBgColor } from '@/lib/utils'

type TrendStatus = 'new' | 'saved' | 'used' | 'dismissed'

interface TrendItem {
  id: string
  topic: string
  description: string
  momentum_score: number
  growth_percentage: number
  source_platform: string
  content_angles: string[]
  example_creators: string[]
  status: TrendStatus
}

const DEMO_TRENDS: TrendItem[] = [
  {
    id: '1',
    topic: 'Film photography revival',
    description: 'The analog photography trend is surging with 35mm film content showing massive engagement across platforms. Creators sharing their film developing process, camera gear, and grainy aesthetic shots are seeing 3x normal engagement.',
    momentum_score: 92,
    growth_percentage: 47,
    source_platform: 'Cross-platform',
    content_angles: ['Behind the scenes film developing', 'Film vs digital comparison reels', 'Thrift store camera finds', '35mm photo dump carousels'],
    example_creators: ['@filmneverdied', '@35mmcollective', '@analoguemagazine'],
    status: 'new',
  },
  {
    id: '2',
    topic: 'Micro-adventure content',
    description: 'Short local adventures (day trips, dawn patrols, urban exploration) outperforming traditional travel content. Low-budget, spontaneous energy resonates with younger audiences.',
    momentum_score: 85,
    growth_percentage: 34,
    source_platform: 'TikTok',
    content_angles: ['5am challenge reels', 'Secret spot reveals', '$0 adventure series', 'Local hidden gems carousel'],
    example_creators: ['@microadventures', '@yesbuthow', '@localwild'],
    status: 'new',
  },
  {
    id: '3',
    topic: 'AI art + handmade hybrid',
    description: 'Creators blending AI-generated concepts with handmade execution. The "designed by AI, made by humans" angle is generating curiosity and strong engagement.',
    momentum_score: 78,
    growth_percentage: 62,
    source_platform: 'Pinterest',
    content_angles: ['AI sketch to real product', 'AI-inspired outfit styling', 'Prompt to painting process', 'AI x craft collab'],
    example_creators: ['@aiartdaily', '@prompttopaint', '@futurehandmade'],
    status: 'new',
  },
  {
    id: '4',
    topic: 'Slow morning routines',
    description: 'The anti-hustle morning routine trend is growing. Emphasis on calm, intentional mornings with coffee rituals, journaling, and gentle movement. High save rates.',
    momentum_score: 73,
    growth_percentage: 28,
    source_platform: 'YouTube',
    content_angles: ['ASMR morning routine', 'No phone first hour challenge', 'Coffee ritual close-ups', 'Morning pages journaling'],
    example_creators: ['@slowmorning', '@mindfulmonday', '@themorningritual'],
    status: 'new',
  },
  {
    id: '5',
    topic: 'Gear minimalism',
    description: 'One bag, one board, one camera — the minimalist gear movement is resonating. "Everything I need" posts with curated flat lays getting high saves.',
    momentum_score: 68,
    growth_percentage: 21,
    source_platform: 'Reddit',
    content_angles: ['One bag challenge', 'Essential kit flat lay', 'Gear I stopped using', 'Budget vs premium face-off'],
    example_creators: ['@onebag', '@minimalgear', '@essentialsonly'],
    status: 'new',
  },
  {
    id: '6',
    topic: 'Vintage sportswear resurgence',
    description: 'Vintage sports jerseys, retro sneakers, and 90s athletic wear are trending hard in streetwear circles. Thrift flip content around vintage sportswear is exploding.',
    momentum_score: 64,
    growth_percentage: 19,
    source_platform: 'TikTok',
    content_angles: ['Thrift flip vintage jersey', 'How to style vintage sportswear', 'Best vintage sports finds', 'Retro sneaker collection tour'],
    example_creators: ['@vintagejerseyco', '@retrokicks', '@90ssportswear'],
    status: 'new',
  },
]

const platformIcons: Record<string, React.ElementType> = {
  'Cross-platform': Globe,
  'TikTok': Music2,
  'YouTube': Youtube,
  'Reddit': MessageSquare,
  'Pinterest': Image,
  'Google Trends': TrendingUp,
}

export default function TrendRadarPage() {
  const [trends, setTrends] = useState(DEMO_TRENDS)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')

  const updateStatus = (id: string, status: TrendStatus) => {
    setTrends((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const platforms = ['all', ...Array.from(new Set(DEMO_TRENDS.map((t) => t.source_platform)))]

  const filteredTrends = trends.filter((t) => {
    if (t.status === 'dismissed') return false
    if (filterPlatform !== 'all' && t.source_platform !== filterPlatform) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-400" />
            Trend Radar
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Emerging trends across platforms, personalized to your niche
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">
          <Sparkles className="h-4 w-4" />
          Scan for Trends
        </button>
      </div>

      {/* Platform Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setFilterPlatform(platform)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
              filterPlatform === platform
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'bg-surface text-text-secondary border border-border hover:text-text-primary'
            )}
          >
            {platform === 'all' ? 'All Platforms' : platform}
          </button>
        ))}
      </div>

      {/* Trends List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredTrends.map((trend, i) => {
            const PlatformIcon = platformIcons[trend.source_platform] || Globe
            const isExpanded = expandedId === trend.id

            return (
              <motion.div
                key={trend.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
                className="hover-card overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : trend.id)}
                  className="w-full p-5 flex items-start gap-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <PlatformIcon className="h-4 w-4 text-text-secondary" />
                      <span className="text-xs text-text-secondary">{trend.source_platform}</span>
                      {trend.status === 'saved' && (
                        <span className="text-xs text-accent bg-accent/10 rounded-full px-2 py-0.5">Saved</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">{trend.topic}</h3>
                    <p className="text-sm text-text-secondary line-clamp-2">{trend.description}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className={cn('text-sm font-bold px-2 py-0.5 rounded', getScoreBgColor(trend.momentum_score))}>
                        {trend.momentum_score}
                      </div>
                      <span className="text-xs text-text-secondary">momentum</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-success">+{trend.growth_percentage}%</div>
                      <span className="text-xs text-text-secondary">growth</span>
                    </div>
                    <ChevronDown className={cn('h-5 w-5 text-text-secondary transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
                        {/* Content Angles */}
                        <div>
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Content Angles</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {trend.content_angles.map((angle, j) => (
                              <div key={j} className="flex items-center gap-2 rounded-lg bg-background/50 border border-border/50 px-3 py-2">
                                <Sparkles className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                                <span className="text-sm text-text-primary">{angle}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Example Creators */}
                        <div>
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Example Creators</h4>
                          <div className="flex flex-wrap gap-2">
                            {trend.example_creators.map((creator, j) => (
                              <span key={j} className="text-sm text-accent bg-accent/5 border border-accent/20 rounded-full px-3 py-1">
                                {creator}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(trend.id, 'used') }}
                            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-hover transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" /> Generate Content Idea
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation() }}
                            className="flex items-center gap-1.5 rounded-lg bg-accent/10 text-accent border border-accent/20 px-3 py-1.5 text-xs font-medium hover:bg-accent/20 transition-colors"
                          >
                            <Calendar className="h-3.5 w-3.5" /> Add to Calendar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(trend.id, 'saved') }}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <Bookmark className="h-3.5 w-3.5" /> Save
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation() }}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <FlaskConical className="h-3.5 w-3.5" /> Add to Experiment
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatus(trend.id, 'dismissed') }}
                            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-danger transition-colors"
                          >
                            <X className="h-3.5 w-3.5" /> Dismiss
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
