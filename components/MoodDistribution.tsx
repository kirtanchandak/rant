'use client'

type BucketData = {
  great: number
  good: number
  meh: number
  rough: number
  total: number
}

export function MoodDistribution({ data }: { data: BucketData }) {
  if (data.total === 0) return null

  const buckets = [
    { key: 'great', label: 'Great', color: '#27c93f', count: data.great },
    { key: 'good', label: 'Good', color: '#4a9eff', count: data.good },
    { key: 'meh', label: 'Meh', color: '#ffbd2e', count: data.meh },
    { key: 'rough', label: 'Rough', color: '#ff4d00', count: data.rough },
  ]

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="h-3 w-full flex rounded-full overflow-hidden bg-secondary/30">
        {buckets.map(({ key, color, count }) => {
          const pct = (count / data.total) * 100
          if (pct === 0) return null
          return (
            <div
              key={key}
              className="h-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {buckets.map(({ key, label, color, count }) => {
          const pct = Math.round((count / data.total) * 100)
          if (pct === 0) return null
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground/60">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
