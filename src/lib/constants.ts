export const INTEREST_CATEGORIES = [
  'Surf', 'Skate', 'Snow', 'BMX', 'Motocross', 'Climbing',
  'Running', 'Cycling', 'Fitness', 'Yoga', 'Martial Arts',
  'Football', 'Basketball', 'Tennis', 'Golf', 'Padel',
  'Food', 'Coffee', 'Wine', 'Restaurants',
  'Travel', 'Van Life', 'Hiking', 'Camping',
  'Music', 'DJ', 'Festivals', 'Concerts',
  'Fashion', 'Streetwear', 'Vintage', 'Luxury',
  'Art', 'Photography', 'Film', 'Design', 'Architecture',
  'Gaming', 'Tech', 'Cars', 'Motorcycles',
  'Pets', 'Parenting', 'Education',
  'Sustainability', 'Wellness', 'Mindfulness',
  'Beauty', 'Skincare', 'Hair',
  'Business', 'Entrepreneurship', 'Startups',
] as const

export const CONTENT_STYLES = [
  'Education', 'Entertainment', 'Inspiration', 'Humor',
  'Documentary', 'Aesthetic', 'Behind the scenes',
  'Community', 'Reviews', 'Tutorials', 'Personal story',
] as const

export const PRIMARY_GOALS = [
  'Grow my following',
  'Increase engagement',
  'Build a community',
  'Drive traffic to my website',
  'Get brand collaborations',
  'Establish thought leadership',
  'Promote my business',
  'Build a personal brand',
] as const

export const CATEGORY_ICONS: Record<string, string> = {
  Surf: '🏄', Skate: '🛹', Snow: '🏔️', BMX: '🚲', Motocross: '🏍️', Climbing: '🧗',
  Running: '🏃', Cycling: '🚴', Fitness: '💪', Yoga: '🧘', 'Martial Arts': '🥋',
  Football: '⚽', Basketball: '🏀', Tennis: '🎾', Golf: '⛳', Padel: '🏓',
  Food: '🍜', Coffee: '☕', Wine: '🍷', Restaurants: '🍽️',
  Travel: '✈️', 'Van Life': '🚐', Hiking: '🥾', Camping: '⛺',
  Music: '🎵', DJ: '🎧', Festivals: '🎪', Concerts: '🎤',
  Fashion: '👗', Streetwear: '👟', Vintage: '🕰️', Luxury: '💎',
  Art: '🎨', Photography: '📷', Film: '🎬', Design: '✏️', Architecture: '🏛️',
  Gaming: '🎮', Tech: '💻', Cars: '🚗', Motorcycles: '🏍️',
  Pets: '🐾', Parenting: '👶', Education: '📚',
  Sustainability: '♻️', Wellness: '🌿', Mindfulness: '🧠',
  Beauty: '💄', Skincare: '✨', Hair: '💇',
  Business: '📈', Entrepreneurship: '🚀', Startups: '💡',
}

export const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Discover', href: '/discover', icon: 'Search' },
  { name: 'Daily Copilot', href: '/copilot', icon: 'Sparkles' },
  { name: 'Content Lab', href: '/content', icon: 'Beaker' },
  { name: 'Trend Radar', href: '/trends', icon: 'TrendingUp' },
  { name: 'Profile Analyzer', href: '/profile', icon: 'UserCheck' },
  { name: 'Growth Strategy', href: '/strategy', icon: 'Target' },
  { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
  { name: 'Experiments', href: '/experiments', icon: 'FlaskConical' },
  { name: 'Outreach', href: '/outreach', icon: 'Send' },
  { name: 'Invite Friends', href: '/invite', icon: 'UserPlus' },
  { name: 'Automation', href: '/automation', icon: 'Bot' },
] as const
