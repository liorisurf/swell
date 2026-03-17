import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, categories, sub_interests, content_styles, topic } = body

    let prompt = ''

    if (type === 'ideas') {
      prompt = `Generate 6 Instagram content ideas for a creator in the ${categories?.join(', ')} niche.
Sub-interests: ${sub_interests || 'Various'}
Content styles: ${content_styles?.join(', ') || 'Mixed'}

Return JSON array:
[{"title": "Idea title", "format": "Reel|Carousel|Post|Story", "description": "2-3 sentences", "hooks": ["Hook 1", "Hook 2", "Hook 3"], "hashtags": ["#tag1", "#tag2"], "content_potential_score": 85}]

Be specific to the niche. Return ONLY valid JSON.`
    } else if (type === 'hooks') {
      prompt = `Generate 5 hook variations for this Instagram Reel idea: "${topic}"
Niche: ${categories?.join(', ')}

Return JSON array:
[{"hook": "The hook text", "format": "Reel", "style": "Question|Statement|Statistic|Storytelling|Controversy"}]

Make hooks scroll-stopping and specific. Return ONLY valid JSON.`
    } else if (type === 'hashtags') {
      prompt = `Generate hashtag sets for Instagram content about: "${topic}"
Niche: ${categories?.join(', ')}

Return JSON:
{
  "primary": [{"tag": "#hashtag", "posts": "125K"}],
  "growth": [{"tag": "#hashtag", "posts": "2.1M"}],
  "community": [{"tag": "#hashtag", "posts": "45K"}]
}

Include 8 hashtags per set. Primary = niche specific, Growth = wider reach, Community = engagement focused.
Return ONLY valid JSON.`
    } else if (type === 'caption') {
      prompt = `Write an Instagram caption for: "${topic}"
Niche: ${categories?.join(', ')}
Style: ${content_styles?.join(', ') || 'Authentic'}

Return JSON:
{"caption": "The full caption text with line breaks", "cta": "Call to action suggestion"}

Write in an authentic, engaging voice. Include relevant emojis sparingly. Return ONLY valid JSON.`
    }

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
    console.error('Content generation error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
