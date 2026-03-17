import { createServerClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id, email, full_name } = await request.json()

    const supabase = createServerClient()

    const { error } = await supabase.from('users').upsert({
      id,
      email,
      full_name,
      onboarding_completed: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
