import { create } from 'zustand'

interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
}

interface Workspace {
  id: string
  name: string
  owner_id: string
  instagram_username: string | null
  primary_goal: string | null
  target_audience: string | null
  content_styles: string[]
}

interface OnboardingData {
  workspaceName: string
  instagramUsername: string
  categories: string[]
  subInterests: string
  targetAudience: string
  contentStyles: string[]
  primaryGoal: string
}

interface AppState {
  user: User | null
  workspace: Workspace | null
  onboarding: OnboardingData
  sidebarOpen: boolean

  setUser: (user: User | null) => void
  setWorkspace: (workspace: Workspace | null) => void
  updateOnboarding: (data: Partial<OnboardingData>) => void
  resetOnboarding: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

const defaultOnboarding: OnboardingData = {
  workspaceName: '',
  instagramUsername: '',
  categories: [],
  subInterests: '',
  targetAudience: '',
  contentStyles: [],
  primaryGoal: '',
}

export const useAppStore = create<AppState>()((set) => ({
  user: null,
  workspace: null,
  onboarding: defaultOnboarding,
  sidebarOpen: true,

  setUser: (user) => set({ user }),
  setWorkspace: (workspace) => set({ workspace }),
  updateOnboarding: (data) =>
    set((state) => ({
      onboarding: { ...state.onboarding, ...data },
    })),
  resetOnboarding: () => set({ onboarding: defaultOnboarding }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
