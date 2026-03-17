'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  Users,
  Eye,
  Heart,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn, formatNumber, formatPercentage } from '@/lib/utils'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08 },
  },
}

type TimeRange = '7d' | '30d' | '90d'

// Demo data generators
const followerGrowth7d = [
  { date: 'Mon', followers: 24200 },
  { date: 'Tue', followers: 24280 },
  { date: 'Wed', followers: 24350 },
  { date: 'Thu', followers: 24410 },
  { date: 'Fri', followers: 24520 },
  { date: 'Sat', followers: 24650 },
  { date: 'Sun', followers: 24800 },
]

const followerGrowth30d = [
  { date: 'Week 1', followers: 22800 },
  { date: 'Week 2', followers: 23200 },
  { date: 'Week 3', followers: 23650 },
  { date: 'Week 4', followers: 24800 },
]

const followerGrowth90d = [
  { date: 'Jan', followers: 18500 },
  { date: 'Feb', followers: 20200 },
  { date: 'Mar', followers: 22100 },
  { date: 'Apr', followers: 23400 },
  { date: 'May', followers: 24800 },
]

const engagementByType = [
  { type: 'Reels', engagement: 5.2, reach: 12400 },
  { type: 'Carousels', engagement: 4.1, reach: 8300 },
  { type: 'Static', engagement: 2.3, reach: 4100 },
  { type: 'Stories', engagement: 3.8, reach: 6800 },
]

interface PostData {
  id: string
  caption: string
  type: string
  likes: number
  comments: number
  saves: number
  reach: number
  engagementRate: number
  date: string
}

const bestPosts: PostData[] = [
  { id: '1', caption: '5 Design Principles Every Brand Needs', type: 'Carousel', likes: 1820, comments: 94, saves: 540, reach: 18200, engagementRate: 6.8, date: '2024-03-10' },
  { id: '2', caption: 'Logo Process Start to Finish', type: 'Reel', likes: 2340, comments: 156, saves: 380, reach: 24500, engagementRate: 5.9, date: '2024-03-08' },
  { id: '3', caption: 'Client Brand Reveal', type: 'Reel', likes: 1650, comments: 88, saves: 290, reach: 16800, engagementRate: 5.4, date: '2024-03-05' },
]

const worstPosts: PostData[] = [
  { id: '4', caption: 'Monday Motivation Quote', type: 'Static', likes: 180, comments: 12, saves: 8, reach: 2100, engagementRate: 0.9, date: '2024-03-12' },
  { id: '5', caption: 'Office Setup Photo', type: 'Static', likes: 240, comments: 18, saves: 15, reach: 2800, engagementRate: 1.1, date: '2024-03-07' },
  { id: '6', caption: 'Happy Friday Post', type: 'Static', likes: 310, comments: 22, saves: 10, reach: 3200, engagementRate: 1.3, date: '2024-03-01' },
]

const statsData: Record<TimeRange, { followers: number; followersChange: number; reach: number; reachChange: number; engagementRate: number; engagementChange: number; profileVisits: number; profileVisitsChange: number }> = {
  '7d': { followers: 24800, followersChange: 2.4, reach: 68400, reachChange: 12.3, engagementRate: 3.8, engagementChange: 0.4, profileVisits: 1240, profileVisitsChange: 8.6 },
  '30d': { followers: 24800, followersChange: 8.8, reach: 245000, reachChange: 18.2, engagementRate: 3.6, engagementChange: 0.8, profileVisits: 4820, profileVisitsChange: 15.3 },
  '90d': { followers: 24800, followersChange: 34.1, reach: 680000, reachChange: 42.5, engagementRate: 3.4, engagementChange: 1.2, profileVisits: 14200, profileVisitsChange: 28.7 },
}

const weeklySummary = {
  summary: 'Strong week overall. Reels drove 62% of total reach. The "5 Design Principles" carousel was your top performer with a 6.8% engagement rate. Static motivational posts continue to underperform. Consider replacing Monday quote posts with quick-tip Reels. Follower growth accelerated on Thursday after the brand reveal video.',
  highlights: [
    'Engagement rate up 0.4% week-over-week',
    'Carousel saves increased 32% compared to last week',
    'Thursday brand reveal Reel reached 3.2x your average',
  ],
}

const followerDataMap: Record<TimeRange, typeof followerGrowth7d> = {
  '7d': followerGrowth7d,
  '30d': followerGrowth30d,
  '90d': followerGrowth90d,
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3 shadow-lg">
        <p className="text-xs text-text-secondary">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-medium text-text-primary">
            {entry.dataKey === 'engagement'
              ? `${entry.value}%`
              : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  format = 'number',
}: {
  title: string
  value: number
  change: number
  icon: React.ComponentType<{ className?: string }>
  format?: 'number' | 'percentage'
}) {
  const isPositive = change >= 0
  return (
    <motion.div
      variants={fadeInUp}
      className="hover-card rounded-xl border border-border bg-surface p-5"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-accent/10 p-2">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          )}
        >
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {formatPercentage(change)}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-text-primary">
        {format === 'percentage' ? `${value}%` : formatNumber(value)}
      </p>
      <p className="text-sm text-text-secondary">{title}</p>
    </motion.div>
  )
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const stats = statsData[timeRange]
  const followerData = followerDataMap[timeRange]

  const handleExportCSV = () => {
    const headers = 'Caption,Type,Likes,Comments,Saves,Reach,Engagement Rate,Date\n'
    const rows = [...bestPosts, ...worstPosts]
      .map(
        (p) =>
          `"${p.caption}",${p.type},${p.likes},${p.comments},${p.saves},${p.reach},${p.engagementRate}%,${p.date}`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `swell-analytics-${timeRange}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <motion.div {...fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
            <p className="text-text-secondary">Track your growth and content performance.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            >
              <FileText className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </motion.div>

        {/* Time Range Tabs */}
        <motion.div {...fadeInUp} transition={{ delay: 0.05 }}>
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  timeRange === range
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard title="Followers" value={stats.followers} change={stats.followersChange} icon={Users} />
          <StatCard title="Reach" value={stats.reach} change={stats.reachChange} icon={Eye} />
          <StatCard title="Engagement Rate" value={stats.engagementRate} change={stats.engagementChange} icon={Heart} format="percentage" />
          <StatCard title="Profile Visits" value={stats.profileVisits} change={stats.profileVisitsChange} icon={UserPlus} />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Follower Growth Chart */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.15 }}
            className="hover-card rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <TrendingUp className="h-5 w-5 text-accent" />
              Follower Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B3A4B" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="#00A896"
                    strokeWidth={2}
                    dot={{ fill: '#00A896', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#00A896' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Engagement by Content Type */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="hover-card rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <Heart className="h-5 w-5 text-accent" />
              Engagement by Content Type
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B3A4B" />
                  <XAxis dataKey="type" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="engagement" fill="#00A896" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Posts Tables */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Best Performing */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.25 }}
            className="hover-card rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <TrendingUp className="h-5 w-5 text-success" />
              Best Performing Posts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="pb-3 pr-4 font-medium">Post</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Reach</th>
                    <th className="pb-3 font-medium">Eng.</th>
                  </tr>
                </thead>
                <tbody>
                  {bestPosts.map((post) => (
                    <tr key={post.id} className="border-b border-border/50">
                      <td className="max-w-[180px] truncate py-3 pr-4 text-text-primary">
                        {post.caption}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                          {post.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">{formatNumber(post.reach)}</td>
                      <td className="py-3 font-medium text-success">{post.engagementRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Worst Performing */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="hover-card rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
              <TrendingDown className="h-5 w-5 text-danger" />
              Lowest Performing Posts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="pb-3 pr-4 font-medium">Post</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Reach</th>
                    <th className="pb-3 font-medium">Eng.</th>
                  </tr>
                </thead>
                <tbody>
                  {worstPosts.map((post) => (
                    <tr key={post.id} className="border-b border-border/50">
                      <td className="max-w-[180px] truncate py-3 pr-4 text-text-primary">
                        {post.caption}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                          {post.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-text-secondary">{formatNumber(post.reach)}</td>
                      <td className="py-3 font-medium text-danger">{post.engagementRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Weekly Summary */}
        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.35 }}
          className="hover-card rounded-xl border border-border bg-surface p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-text-primary">Weekly Summary</h3>
          <p className="leading-relaxed text-text-secondary">{weeklySummary.summary}</p>
          <div className="mt-4 space-y-2">
            {weeklySummary.highlights.map((highlight, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <p className="text-sm text-text-primary">{highlight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
