import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, categories, target_audience } = body

    const prompt = `You are SWELL's Profile Analyzer AI. Analyze this Instagram profile and generate a growth report.

Username: @${username}
Creator's niche: ${categories?.join(', ') || 'General lifestyle'}
Target audience: ${target_audience || 'General'}

Generate a comprehensive analysis as JSON:
{
  "strengths": ["Strength 1 with specific detail", "Strength 2", "Strength 3"],
  "growth_blockers": ["Blocker 1 with specific detail", "Blocker 2", "Blocker 3"],
  "content_opportunities": ["Opportunity 1 with specific format suggestion", "Opportunity 2", "Opportunity 3"],
  "audience_alignment": "A 2-3 sentence assessment of how well current content matches the intended audience",
  "bio_suggestions": ["Suggested bio rewrite option 1", "Suggested bio rewrite option 2"],
  "posting_strategy": "Detailed posting strategy recommendation including cadence, best times, and format mix"
}

Make everything specific and actionable. Reference specific content formats, hooks, and tactics.
Return ONLY valid JSON.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response')
    }

    return NextResponse.json(JSON.parse(textContent.text))
  } catch (error) {
    console.error('Profile analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze profile' }, { status: 500 })
  }
}
