'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Copy, Check, Link as LinkIcon, Users, Calendar, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'

const DEMO_INVITES = [
  { name: 'Alex Rivera', email: 'alex@example.com', joined: '2024-03-12', status: 'active' },
  { name: 'Sam Chen', email: 'sam@example.com', joined: '2024-03-10', status: 'active' },
  { name: 'Jordan Lee', email: 'jordan@example.com', joined: null, status: 'pending' },
]

export default function InvitePage() {
  const [copied, setCopied] = useState(false)
  const inviteLink = 'https://swell.app/invite/abc123xyz'
  const inviteCode = 'abc123xyz'

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeInvites = DEMO_INVITES.filter((i) => i.status === 'active').length
  const pendingInvites = DEMO_INVITES.filter((i) => i.status === 'pending').length

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Gift className="h-6 w-6 text-accent" />
          Invite Friends
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Share SWELL with friends and grow together. Everyone gets full access — no limits.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hover-card p-4 text-center">
          <Users className="h-5 w-5 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary">{activeInvites}</div>
          <div className="text-xs text-text-secondary">Friends Joined</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="hover-card p-4 text-center">
          <LinkIcon className="h-5 w-5 text-accent mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary">{activeInvites + pendingInvites}</div>
          <div className="text-xs text-text-secondary">Total Invites</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="hover-card p-4 text-center">
          <UserPlus className="h-5 w-5 text-warning mx-auto mb-2" />
          <div className="text-2xl font-bold text-text-primary">{pendingInvites}</div>
          <div className="text-xs text-text-secondary">Pending</div>
        </motion.div>
      </div>

      {/* Invite Link */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="hover-card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Your Invite Link</h2>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg bg-background border border-border px-4 py-3 font-mono text-sm text-text-secondary truncate">
            {inviteLink}
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all',
              copied
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-accent text-white hover:bg-accent-hover'
            )}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-3">
          Share this link with anyone. They&apos;ll get instant full access to SWELL.
        </p>
      </motion.div>

      {/* Invited Friends */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="hover-card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Invited Friends</h2>
        <div className="space-y-3">
          {DEMO_INVITES.map((invite, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-background/50 border border-border/50 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-bold">
                {invite.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{invite.name}</p>
                <p className="text-xs text-text-secondary">{invite.email}</p>
              </div>
              {invite.joined ? (
                <div className="flex items-center gap-1.5 text-xs text-success">
                  <Check className="h-3.5 w-3.5" />
                  Joined {new Date(invite.joined).toLocaleDateString()}
                </div>
              ) : (
                <span className="text-xs text-warning bg-warning/10 rounded-full px-2 py-0.5">
                  Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
