import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, niche, target_audience, action } = body

    if (action === 'daily_recommendations') {
      return handleDailyRecommendations(username, niche)
    }

    const prompt = `You are SWELL's elite Instagram Profile Analyzer AI. Analyze the Instagram profile @${username} and produce a comprehensive, data-driven growth report.

Creator's niche: ${niche || 'General lifestyle / content creation'}
Target audience: ${target_audience || 'General Instagram users'}

Generate the analysis as a strict JSON object with the following structure. Be specific, creative, and actionable. Simulate realistic data for this type of account.

{
  "profileScore": <number 0-100 representing overall profile health>,
  "username": "${username}",
  "fullName": "<realistic full name or brand name>",
  "followers": <realistic follower count number>,
  "following": <realistic following count number>,
  "posts": <realistic post count number>,
  "engagementRate": <realistic engagement rate as number like 3.2>,
  "bioAnalysis": {
    "score": <number 0-100>,
    "currentBio": "<a realistic current bio for this type of account>",
    "issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
    "suggestedBio": "<an optimized bio suggestion>",
    "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
  },
  "contentStrategy": {
    "score": <number 0-100>,
    "recommendedFormats": [
      { "format": "<format name>", "percentage": <number>, "reason": "<why>" }
    ],
    "optimalPostingTimes": [
      { "day": "<day>", "time": "<time>", "reason": "<why this time>" }
    ],
    "contentPillars": ["<pillar 1>", "<pillar 2>", "<pillar 3>", "<pillar 4>"],
    "tips": ["<specific tip 1>", "<specific tip 2>", "<specific tip 3>"]
  },
  "growthOpportunities": [
    { "title": "<opportunity>", "impact": "high|medium|low", "effort": "high|medium|low", "description": "<detailed description>" }
  ],
  "hashtagStrategy": {
    "score": <number 0-100>,
    "recommended": [
      { "tag": "<hashtag without #>", "posts": "<e.g. 125K>", "difficulty": "easy|medium|hard" }
    ],
    "avoidTags": ["<tag to avoid>"],
    "tips": ["<hashtag tip 1>", "<hashtag tip 2>"]
  },
  "competitorAnalysis": [
    { "username": "<competitor handle>", "followers": "<follower count string>", "strength": "<what they do well>", "lessonToLearn": "<specific takeaway>" }
  ],
  "weeklyActionPlan": [
    { "day": "Monday", "tasks": ["<task 1>", "<task 2>"] },
    { "day": "Tuesday", "tasks": ["<task 1>", "<task 2>"] },
    { "day": "Wednesday", "tasks": ["<task 1>", "<task 2>"] },
    { "day": "Thursday", "tasks": ["<task 1>", "<task 2>"] },
    { "day": "Friday", "tasks": ["<task 1>", "<task 2>"] },
    { "day": "Saturday", "tasks": ["<task 1>", "<task 2>"] },
    { "day": "Sunday", "tasks": ["<task 1>", "<task 2>"] }
  ],
  "strengths": [
    { "title": "<strength>", "description": "<detail>" }
  ],
  "blockers": [
    { "title": "<blocker>", "description": "<detail>" }
  ]
}

Rules:
- Make all recommendations SPECIFIC and ACTIONABLE — not generic advice.
- Reference actual Instagram features, algorithm behaviors, and real content formats.
- The profile score should reflect realistic strengths and weaknesses.
- Hashtags should be realistic, niche-relevant, and have varied difficulty levels. Include 10-15 hashtags.
- Competitor accounts should be plausible handles in the same niche space. Include 3-4 competitors.
- The weekly action plan should be detailed with 2-3 tasks per day.
- Growth opportunities should have 5-6 items.
- Strengths should have 3 items, blockers should have 3 items.
- Return ONLY valid JSON, no markdown formatting.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response')
    }

    // Parse JSON, handling potential markdown code fences
    let jsonText = textContent.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const analysis = JSON.parse(jsonText)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Profile analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze profile' }, { status: 500 })
  }
}

async function handleDailyRecommendations(username: string, niche?: string) {
  const prompt = `You are SWELL's Instagram growth coach. Generate fresh daily recommendations for @${username} (niche: ${niche || 'general'}).

Return a JSON object:
{
  "greeting": "<personalized motivational greeting>",
  "todaysFocus": "<one key area to focus on today>",
  "recommendations": [
    { "category": "content|engagement|growth|optimization", "title": "<rec title>", "description": "<specific actionable recommendation>", "priority": "high|medium|low" }
  ],
  "quickWin": { "title": "<quick win>", "description": "<something they can do in 5 minutes>" },
  "inspirationPrompt": "<a creative content idea prompt for today>"
}

Provide 5 unique recommendations. Be specific and creative. Return ONLY valid JSON.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textContent = message.content.find((c) => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response')
    }

    let jsonText = textContent.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    return NextResponse.json(JSON.parse(jsonText))
  } catch (error) {
    console.error('Daily recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
