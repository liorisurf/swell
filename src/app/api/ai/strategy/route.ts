import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      categories,
      sub_interests,
      target_audience,
      content_styles,
      primary_goal,
      instagram_username,
    } = body

    const prompt = `You are SWELL, an Instagram growth strategy AI. Generate a personalized 30-day growth strategy for this creator/brand.

Profile:
- Niche categories: ${categories.join(', ')}
- Sub-interests: ${sub_interests || 'Not specified'}
- Target audience: ${target_audience}
- Content styles: ${content_styles.join(', ')}
- Primary goal: ${primary_goal}
${instagram_username ? `- Instagram: @${instagram_username}` : ''}

Generate a JSON response with this exact structure:
{
  "niche_summary": "A 2-3 sentence summary of their niche positioning and unique angle",
  "content_formats": ["Array of 5-7 specific content formats that would work best"],
  "posting_schedule": {
    "frequency": "How often to post (e.g. '5-7 times per week')",
    "best_days": ["Best days to post"],
    "best_times": ["Best time windows"],
    "format_mix": "Recommended mix of Reels, Carousels, Stories, Posts"
  },
  "growth_levers": ["Array of 5-7 specific growth tactics for their niche"],
  "experiments": [
    {
      "title": "Experiment name",
      "hypothesis": "What we're testing",
      "success_metric": "How to measure success",
      "duration": "How long to run"
    }
  ]
}

Make everything highly specific to their niche — not generic advice. Reference specific topics, communities, formats, and tactics relevant to their exact interests. Include 3 experiments.

Return ONLY valid JSON, no markdown.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    const strategy = JSON.parse(textContent.text)
    return NextResponse.json(strategy)
  } catch (error) {
    console.error('Strategy generation error:', error)
    // Return a default strategy on error
    return NextResponse.json({
      niche_summary: 'Your growth strategy is being prepared. Check back soon for personalized recommendations.',
      content_formats: ['Reels', 'Carousels', 'Stories', 'Single image posts', 'Collaboration posts'],
      posting_schedule: {
        frequency: '5-7 times per week',
        best_days: ['Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        best_times: ['9:00 AM', '12:00 PM', '6:00 PM'],
        format_mix: '50% Reels, 25% Carousels, 15% Stories, 10% Static posts',
      },
      growth_levers: [
        'Engage with accounts in your niche daily',
        'Create content around trending topics',
        'Collaborate with creators at a similar level',
        'Use strategic hashtag sets',
        'Post consistently during peak hours',
      ],
      experiments: [
        {
          title: 'Hook variation test',
          hypothesis: 'Testing 3 different hook styles on Reels to find what drives retention',
          success_metric: 'Average view duration above 50%',
          duration: '2 weeks',
        },
        {
          title: 'Carousel depth test',
          hypothesis: 'Longer carousels (8-10 slides) generate more saves than shorter ones (4-5)',
          success_metric: 'Save rate per post',
          duration: '2 weeks',
        },
        {
          title: 'Community engagement sprint',
          hypothesis: 'Engaging 30 min/day with niche accounts will increase profile visits by 40%',
          success_metric: 'Profile visits increase',
          duration: '2 weeks',
        },
      ],
    })
  }
}
