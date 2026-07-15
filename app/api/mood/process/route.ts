import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeMood } from '@/lib/mood'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { entryId } = body

    if (!entryId) {
      return NextResponse.json({ error: 'Missing entryId' }, { status: 400 })
    }

    // Fetch the entry
    const { data: entry, error: fetchError } = await supabase
      .from('entries')
      .select('id, content, user_id')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (!entry.content.trim()) {
      return NextResponse.json({ error: 'Entry has no content' }, { status: 400 })
    }

    // Check if mood already exists
    const { data: existing } = await supabase
      .from('entry_moods')
      .select('id')
      .eq('entry_id', entryId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: true, message: 'Mood already analyzed', skipped: true })
    }

    // Analyze mood via Gemini
    const moodResult = await analyzeMood(entry.content)

    // Insert into entry_moods
    const { error: insertError } = await supabase
      .from('entry_moods')
      .insert({
        entry_id: entry.id,
        user_id: user.id,
        mood_score: Math.max(0, Math.min(100, moodResult.mood_score)),
        mood_label: moodResult.mood_label,
        emotions: moodResult.emotions,
        summary: moodResult.summary,
      })

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ success: true, mood: moodResult })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Mood processing error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
