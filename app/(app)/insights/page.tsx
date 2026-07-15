import { createClient } from '@/lib/supabase/server'
import { MoodTimeline } from '@/components/MoodTimeline'
import { PatternCards } from '@/components/PatternCards'
import { Sparkles, PenLine } from 'lucide-react'
import Link from 'next/link'
import type { Memory, EntryMood } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Insights' }

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch mood data with entry created_at for timeline
  const { data: moodsRaw } = await supabase
    .from('entry_moods')
    .select('id, entry_id, user_id, mood_score, mood_label, emotions, summary, created_at, entries!inner(created_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Flatten the joined data
  const moods: (EntryMood & { entry_created_at: string })[] = (moodsRaw || []).map((m: Record<string, unknown>) => {
    const entries = m.entries as { created_at: string } | null
    return {
      id: m.id as string,
      entry_id: m.entry_id as string,
      user_id: m.user_id as string,
      mood_score: m.mood_score as number,
      mood_label: m.mood_label as string,
      emotions: m.emotions as { emotion: string; intensity: number }[],
      summary: m.summary as string,
      created_at: m.created_at as string,
      entry_created_at: entries?.created_at || (m.created_at as string),
    }
  })

  // Fetch memories for pattern cards
  const { data: memoriesRaw } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .order('mention_count', { ascending: false })

  const memories = (memoriesRaw as Memory[]) || []

  // Compute pattern data
  const topPeople = memories.filter((m) => m.type === 'person').slice(0, 5)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const activeProjects = memories
    .filter((m) => m.type === 'project' && new Date(m.last_seen) >= thirtyDaysAgo)
    .slice(0, 5)

  const recurringIdeas = memories
    .filter((m) => m.type === 'interest' || m.type === 'belief')
    .slice(0, 5)

  const goals = memories.filter((m) => m.type === 'goal').slice(0, 5)

  // Compute mood distribution
  let great = 0, good = 0, meh = 0, rough = 0
  moods.forEach((m) => {
    if (m.mood_score >= 80) great++
    else if (m.mood_score >= 60) good++
    else if (m.mood_score >= 40) meh++
    else rough++
  })
  const moodDistribution = { great, good, meh, rough, total: moods.length }

  // Compute top emotions across all entries
  const emotionCounts: Record<string, number> = {}
  moods.forEach((m) => {
    if (Array.isArray(m.emotions)) {
      m.emotions.forEach((e) => {
        const name = e.emotion.toLowerCase()
        emotionCounts[name] = (emotionCounts[name] || 0) + 1
      })
    }
  })
  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([emotion, count]) => ({ emotion, count }))

  // Count total entries and unprocessed
  const { count: totalEntries } = await supabase
    .from('entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const unprocessedCount = (totalEntries || 0) - moods.length

  // Avg mood
  const avgMood = moods.length > 0
    ? Math.round(moods.reduce((sum, m) => sum + m.mood_score, 0) / moods.length)
    : 0

  const getMoodEmoji = (score: number) => {
    if (score >= 80) return '😊'
    if (score >= 60) return '🙂'
    if (score >= 40) return '😐'
    return '😔'
  }

  if (moods.length === 0 && memories.length === 0) {
    return (
      <div className="animate-fade-in py-24 text-center space-y-3">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-muted mb-2">
          <Sparkles className="size-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No insights yet</p>
        <p className="text-muted-foreground/70 text-xs">
          Write more entries and process them to unlock mood trends and pattern detection.
        </p>
        <Link
          href="/write"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition mt-2"
        >
          <PenLine className="size-3.5" />
          Start writing
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-muted-foreground" strokeWidth={1.8} />
          <h1 className="text-xl font-semibold text-foreground">Insights</h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">{moods.length} analyzed</span>
          {unprocessedCount > 0 && (
            <span className="text-[10px] bg-accent/10 text-accent-foreground px-2 py-0.5 rounded-full font-medium">
              {unprocessedCount} pending
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      {moods.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/15 border border-border rounded-xl p-4 text-center space-y-1">
            <div className="text-2xl">{getMoodEmoji(avgMood)}</div>
            <div className="text-lg font-bold text-foreground tabular-nums">{avgMood}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Avg Mood</div>
          </div>
          <div className="bg-secondary/15 border border-border rounded-xl p-4 text-center space-y-1">
            <div className="text-2xl">📝</div>
            <div className="text-lg font-bold text-foreground tabular-nums">{moods.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Analyzed</div>
          </div>
          <div className="bg-secondary/15 border border-border rounded-xl p-4 text-center space-y-1">
            <div className="text-2xl">🧠</div>
            <div className="text-lg font-bold text-foreground tabular-nums">{memories.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Memories</div>
          </div>
        </div>
      )}

      {/* Mood Timeline */}
      {moods.length > 0 && <MoodTimeline moods={moods} />}

      {/* Pattern Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Patterns &amp; Trends</h2>
        <PatternCards
          data={{
            topPeople,
            activeProjects,
            recurringIdeas,
            goals,
            moodDistribution,
            topEmotions,
          }}
        />
      </div>
    </div>
  )
}
