'use client'

import type { EntryMood } from '@/types'

type MoodDay = {
  dateStr: string
  dateLabel: string
  score: number
  label: string
  summary: string
}

export function MoodTimeline({ moods }: { moods: (EntryMood & { entry_created_at: string })[] }) {
  // Build a map from local date string → averaged mood for that day
  const dayMap: Record<string, { totalScore: number; count: number; labels: string[]; summaries: string[] }> = {}

  moods.forEach((m) => {
    const d = new Date(m.entry_created_at)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    if (!dayMap[dateStr]) {
      dayMap[dateStr] = { totalScore: 0, count: 0, labels: [], summaries: [] }
    }
    dayMap[dateStr].totalScore += m.mood_score
    dayMap[dateStr].count += 1
    dayMap[dateStr].labels.push(m.mood_label)
    dayMap[dateStr].summaries.push(m.summary)
  })

  // Generate the last 56 days (8 weeks)
  const now = new Date()
  const days: MoodDay[] = []

  for (let i = 55; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    const entry = dayMap[dateStr]
    if (entry) {
      days.push({
        dateStr,
        dateLabel,
        score: Math.round(entry.totalScore / entry.count),
        label: entry.labels[0],
        summary: entry.summaries[0],
      })
    } else {
      days.push({ dateStr, dateLabel, score: -1, label: '', summary: '' })
    }
  }

  const getBarColor = (score: number) => {
    if (score >= 80) return '#27c93f'
    if (score >= 60) return '#4a9eff'
    if (score >= 40) return '#ffbd2e'
    return '#ff4d00'
  }

  const getBarLabel = (score: number) => {
    if (score >= 80) return 'Great'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Meh'
    return 'Rough'
  }

  // Week separators — find the start index of each new week
  const weekLabels: { idx: number; label: string }[] = []
  let currentWeek = -1
  days.forEach((day, idx) => {
    const d = new Date(day.dateStr + 'T00:00:00Z')
    const weekNum = Math.floor(idx / 7)
    if (weekNum !== currentWeek) {
      currentWeek = weekNum
      weekLabels.push({
        idx,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      })
    }
  })

  return (
    <div className="bg-secondary/15 border border-border rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Mood Timeline</h3>
        <span className="text-[11px] text-muted-foreground font-medium">Last 8 Weeks</span>
      </div>

      {/* Bar chart */}
      <div className="flex gap-[3px] sm:gap-1 items-end h-[120px] sm:h-[140px] pt-2">
        {days.map((day) => {
          const hasData = day.score >= 0
          const height = hasData ? Math.max(day.score, 8) : 0

          return (
            <div key={day.dateStr} className="relative group flex-1 flex items-end h-full">
              {hasData ? (
                <div
                  className="w-full rounded-t-sm transition-opacity cursor-pointer opacity-85 hover:opacity-100"
                  style={{
                    height: `${height}%`,
                    backgroundColor: getBarColor(day.score),
                  }}
                />
              ) : (
                <div className="w-full h-[3px] rounded-full bg-border/40" />
              )}

              {/* Tooltip */}
              {hasData && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none animate-fade-in">
                  <div className="bg-popover text-popover-foreground border border-border text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg space-y-0.5 max-w-[200px]">
                    <div className="font-semibold">{day.dateLabel}</div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block size-2 rounded-full shrink-0"
                        style={{ backgroundColor: getBarColor(day.score) }}
                      />
                      <span>
                        {getBarLabel(day.score)} ({day.score}) · {day.label}
                      </span>
                    </div>
                    {day.summary && (
                      <div className="text-muted-foreground whitespace-normal leading-snug pt-0.5">
                        {day.summary}
                      </div>
                    )}
                  </div>
                  <div className="w-1.5 h-1.5 bg-popover border-r border-b border-border rotate-45 -mt-[4px]" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Week labels */}
      <div className="flex gap-[3px] sm:gap-1">
        {weekLabels.map(({ idx, label }) => (
          <span
            key={idx}
            className="text-[9px] text-muted-foreground/60 font-medium"
            style={{ flex: `0 0 ${(7 / days.length) * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 sm:gap-6 pt-1 flex-wrap">
        {[
          { label: 'Great', color: '#27c93f' },
          { label: 'Good', color: '#4a9eff' },
          { label: 'Meh', color: '#ffbd2e' },
          { label: 'Rough', color: '#ff4d00' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="size-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
