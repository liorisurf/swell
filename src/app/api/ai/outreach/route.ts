import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { target_username, target_context, creator_niche, creator_username } = body

    const prompt = `Generate an Instagram DM draft for a collaboration outreach.

Sender: @${creator_username || 'creator'} in the ${creator_niche || 'lifestyle'} niche
Target: @${target_username}
Context: ${target_context || 'Potential collaboration partner'}

Write a friendly, authentic DM that:
- Opens with genuine compliment about their specific content
- Mentions shared audience/interests
- Proposes a specific collaboration idea
- Keeps it concise (3-4 sentences max)
- Feels human, not templated

Return JSON:
{"message": "The DM text", "follow_up": "A shorter follow-up message if they don't respond"}

Return ONLY valid JSON.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response')
    }

    return NextResponse.json(JSON.parse(textContent.text))
  } catch (error) {
    console.error('Outreach generation error:', error)
    return NextResponse.json({ error: 'Failed to generate outreach draft' }, { status: 500 })
  }
}
