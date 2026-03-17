import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { categories, sub_interests, target_audience, content_styles, primary_goal } = body

    const prompt = `You are SWELL's Daily Copilot AI. Generate a fresh daily action list for an Instagram creator.

Creator Profile:
- Niche: ${categories?.join(', ') || 'General lifestyle'}
- Sub-interests: ${sub_interests || 'Various'}
- Target audience: ${target_audience || 'General'}
- Content styles: ${content_styles?.join(', ') || 'Mixed'}
- Goal: ${primary_goal || 'Grow following'}

Generate a JSON response with this structure:
{
  "accounts_to_visit": [
    {"name": "@username", "followers": "12.5K", "reason": "Why this account", "relevance_score": 85}
  ],
  "posts_to_engage": [
    {"description": "Post description", "suggested_comment": "A thoughtful comment", "reason": "Why engage"}
  ],
  "content_ideas": [
    {"title": "Idea title", "format": "Reel|Carousel|Post", "description": "Details", "content_potential_score": 88}
  ],
  "best_posting_window": {"time": "6:00 PM", "reason": "Why this time"},
  "collaboration_target": {"name": "@username", "reason": "Why collaborate", "collaboration_potential": 78},
  "stop_doing": {"title": "Stop doing this", "reason": "Why to stop"}
}

Include 10 accounts_to_visit, 10 posts_to_engage, and 3 content_ideas. All highly specific to the niche.
Return ONLY valid JSON.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response')
    }

    return NextResponse.json(JSON.parse(textContent.text))
  } catch (error) {
    console.error('Copilot generation error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
