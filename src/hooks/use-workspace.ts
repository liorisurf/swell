'use client'

import { useAppStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

export function useWorkspace() {
  const { workspace, setWorkspace, user } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: ['workspace', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data: member } = await supabase
        .from('workspace_members')
        .select('workspace_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!member) return null

      const { data: ws } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', member.workspace_id)
        .single()

      if (ws) {
        setWorkspace(ws as typeof workspace)
      }
      return ws
    },
    enabled: !!user?.id && !workspace,
  })

  return {
    workspace: workspace || data,
    isLoading,
  }
}
