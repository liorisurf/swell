export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          owner_id: string
          instagram_username: string | null
          primary_goal: string | null
          target_audience: string | null
          content_styles: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          instagram_username?: string | null
          primary_goal?: string | null
          target_audience?: string | null
          content_styles?: string[]
        }
        Update: {
          name?: string
          instagram_username?: string | null
          primary_goal?: string | null
          target_audience?: string | null
          content_styles?: string[]
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'manager' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'manager' | 'viewer'
        }
        Update: {
          role?: 'owner' | 'manager' | 'viewer'
        }
      }
      user_interests: {
        Row: {
          id: string
          workspace_id: string
          category: string
          sub_interests: string[]
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          category: string
          sub_interests?: string[]
        }
        Update: {
          category?: string
          sub_interests?: string[]
        }
      }
      tracked_accounts: {
        Row: {
          id: string
          workspace_id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          follower_count: number | null
          engagement_rate: number | null
          content_style_tags: string[]
          relevance_score: number | null
          opportunity_score: number | null
          list_type: 'competitor' | 'inspiration' | 'collaboration' | 'audience_source'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          follower_count?: number | null
          engagement_rate?: number | null
          content_style_tags?: string[]
          relevance_score?: number | null
          opportunity_score?: number | null
          list_type?: 'competitor' | 'inspiration' | 'collaboration' | 'audience_source'
          notes?: string | null
        }
        Update: {
          display_name?: string | null
          follower_count?: number | null
          engagement_rate?: number | null
          content_style_tags?: string[]
          relevance_score?: number | null
          opportunity_score?: number | null
          list_type?: 'competitor' | 'inspiration' | 'collaboration' | 'audience_source'
          notes?: string | null
          updated_at?: string
        }
      }
      tracked_hashtags: {
        Row: {
          id: string
          workspace_id: string
          hashtag: string
          post_count: number | null
          relevance_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          hashtag: string
          post_count?: number | null
          relevance_score?: number | null
        }
        Update: {
          post_count?: number | null
          relevance_score?: number | null
        }
      }
      daily_recommendations: {
        Row: {
          id: string
          workspace_id: string
          date: string
          type: 'account_visit' | 'post_engage' | 'content_idea' | 'posting_window' | 'collaboration' | 'stop_doing'
          title: string
          description: string
          reason: string
          suggested_action: string | null
          status: 'pending' | 'done' | 'skipped' | 'saved'
          feedback: 'up' | 'down' | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          date: string
          type: 'account_visit' | 'post_engage' | 'content_idea' | 'posting_window' | 'collaboration' | 'stop_doing'
          title: string
          description: string
          reason: string
          suggested_action?: string | null
          status?: 'pending' | 'done' | 'skipped' | 'saved'
          feedback?: 'up' | 'down' | null
        }
        Update: {
          status?: 'pending' | 'done' | 'skipped' | 'saved'
          feedback?: 'up' | 'down' | null
        }
      }
      content_ideas: {
        Row: {
          id: string
          workspace_id: string
          title: string
          description: string
          format: string
          hooks: string[]
          hashtags: string[]
          caption_draft: string | null
          content_potential_score: number | null
          status: 'idea' | 'saved' | 'in_progress' | 'scheduled' | 'published' | 'skipped'
          feedback: 'up' | 'down' | null
          scheduled_for: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          description: string
          format?: string
          hooks?: string[]
          hashtags?: string[]
          caption_draft?: string | null
          content_potential_score?: number | null
          status?: 'idea' | 'saved' | 'in_progress' | 'scheduled' | 'published' | 'skipped'
          feedback?: 'up' | 'down' | null
          scheduled_for?: string | null
        }
        Update: {
          title?: string
          description?: string
          format?: string
          hooks?: string[]
          hashtags?: string[]
          caption_draft?: string | null
          content_potential_score?: number | null
          status?: 'idea' | 'saved' | 'in_progress' | 'scheduled' | 'published' | 'skipped'
          feedback?: 'up' | 'down' | null
          scheduled_for?: string | null
          updated_at?: string
        }
      }
      content_calendar: {
        Row: {
          id: string
          workspace_id: string
          content_idea_id: string | null
          title: string
          description: string | null
          scheduled_date: string
          scheduled_time: string | null
          format: string | null
          status: 'planned' | 'creating' | 'ready' | 'published'
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          content_idea_id?: string | null
          title: string
          description?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          format?: string | null
          status?: 'planned' | 'creating' | 'ready' | 'published'
          position?: number
        }
        Update: {
          content_idea_id?: string | null
          title?: string
          description?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          format?: string | null
          status?: 'planned' | 'creating' | 'ready' | 'published'
          position?: number
        }
      }
      trend_radar_items: {
        Row: {
          id: string
          workspace_id: string
          topic: string
          description: string
          momentum_score: number
          growth_percentage: number | null
          source_platform: string
          content_angles: string[]
          example_creators: string[]
          status: 'new' | 'saved' | 'used' | 'dismissed'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          topic: string
          description: string
          momentum_score: number
          growth_percentage?: number | null
          source_platform: string
          content_angles?: string[]
          example_creators?: string[]
          status?: 'new' | 'saved' | 'used' | 'dismissed'
        }
        Update: {
          status?: 'new' | 'saved' | 'used' | 'dismissed'
        }
      }
      profile_analysis_reports: {
        Row: {
          id: string
          workspace_id: string
          instagram_username: string
          strengths: string[]
          growth_blockers: string[]
          content_opportunities: string[]
          audience_alignment: string
          bio_suggestions: string[]
          posting_strategy: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          instagram_username: string
          strengths: string[]
          growth_blockers: string[]
          content_opportunities: string[]
          audience_alignment: string
          bio_suggestions: string[]
          posting_strategy: string
        }
        Update: {}
      }
      growth_strategies: {
        Row: {
          id: string
          workspace_id: string
          niche_summary: string
          content_formats: string[]
          posting_schedule: Json
          growth_levers: string[]
          experiments: Json[]
          generated_at: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          workspace_id: string
          niche_summary: string
          content_formats: string[]
          posting_schedule: Json
          growth_levers: string[]
          experiments: Json[]
          generated_at?: string
          expires_at: string
          is_active?: boolean
        }
        Update: {
          is_active?: boolean
        }
      }
      experiments: {
        Row: {
          id: string
          workspace_id: string
          title: string
          hypothesis: string
          success_metric: string
          status: 'planned' | 'running' | 'completed' | 'abandoned'
          results: string | null
          ai_summary: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          title: string
          hypothesis: string
          success_metric: string
          status?: 'planned' | 'running' | 'completed' | 'abandoned'
          results?: string | null
          ai_summary?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          title?: string
          hypothesis?: string
          success_metric?: string
          status?: 'planned' | 'running' | 'completed' | 'abandoned'
          results?: string | null
          ai_summary?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
      }
      outreach_targets: {
        Row: {
          id: string
          workspace_id: string
          username: string
          display_name: string | null
          follower_count: number | null
          collaboration_potential: number | null
          status: 'identified' | 'draft_ready' | 'sent' | 'replied' | 'closed' | 'not_interested'
          draft_message: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          username: string
          display_name?: string | null
          follower_count?: number | null
          collaboration_potential?: number | null
          status?: 'identified' | 'draft_ready' | 'sent' | 'replied' | 'closed' | 'not_interested'
          draft_message?: string | null
          notes?: string | null
        }
        Update: {
          display_name?: string | null
          follower_count?: number | null
          collaboration_potential?: number | null
          status?: 'identified' | 'draft_ready' | 'sent' | 'replied' | 'closed' | 'not_interested'
          draft_message?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      invite_links: {
        Row: {
          id: string
          user_id: string
          code: string
          uses: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          uses?: number
        }
        Update: {
          uses?: number
        }
      }
      activity_log: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          action: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          action: string
          details?: Json | null
        }
        Update: {}
      }
    }
  }
}
