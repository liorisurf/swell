'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/lib/store'
import { NAV_ITEMS } from '@/lib/constants'
import {
  LayoutDashboard, Search, Sparkles, Beaker, TrendingUp,
  UserCheck, BarChart3, FlaskConical, Send, UserPlus,
  Target, ChevronLeft, ChevronRight, Shield, Waves, Bot,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Search, Sparkles, Beaker, TrendingUp,
  UserCheck, BarChart3, FlaskConical, Send, UserPlus, Target, Bot,
}

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, user } = useAppStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Waves className="h-7 w-7 text-accent" />
            {sidebarOpen && (
              <span className="text-xl font-bold gradient-text">SWELL</span>
            )}
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                )}
              >
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Safety Badge */}
        <div className="border-t border-border p-3">
          <div className={cn(
            'flex items-center gap-2 rounded-lg bg-success/5 border border-success/20 px-3 py-2',
            !sidebarOpen && 'justify-center px-2'
          )}>
            <Shield className="h-4 w-4 text-success flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-xs text-success">
                All actions are manual. Your account is always safe.
              </span>
            )}
          </div>
        </div>

        {/* User */}
        {user && (
          <div className="border-t border-border p-3">
            <div className={cn(
              'flex items-center gap-3',
              !sidebarOpen && 'justify-center'
            )}>
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold flex-shrink-0">
                {user.full_name?.[0] || user.email[0].toUpperCase()}
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
