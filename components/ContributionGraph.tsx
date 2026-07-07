'use client'

import { useMemo } from 'react'
import type { Entry } from '@/types'

// Helper to add days to a date string
function getOffsetDayStr(dateStr: string, offset: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().split('T')[0]
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function ContributionGraph({ entries }: { entries: Entry[] }) {
  // 1. Group entries by date (local YYYY-MM-DD)
  const countMap = useMemo(() => {
    const counts: Record<string, number> = {}
    entries.forEach((e) => {
      const d = new Date(e.created_at)
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      counts[dateStr] = (counts[dateStr] || 0) + 1
    })
    return counts
  }, [entries])

  // 2. Generate grid of 53 columns (weeks), ending on the Saturday of this week, starting on Sunday of 52 weeks ago
  const { columns, monthLabels } = useMemo(() => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    
    // Find the day of the week for today (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const todayDateObj = new Date(todayStr + 'T00:00:00Z')
    const todayDayOfWeek = todayDateObj.getUTCDay()

    // Saturday of the current week is (6 - todayDayOfWeek) days ahead of today
    const endSaturdayStr = getOffsetDayStr(todayStr, 6 - todayDayOfWeek)

    // Total days: 53 columns * 7 days/column = 371 days
    const totalDays = 53 * 7
    const startSundayStr = getOffsetDayStr(endSaturdayStr, -(totalDays - 1))

    const daysList: { dateStr: string; count: number; isFuture: boolean }[] = []
    let currentStr = startSundayStr

    for (let i = 0; i < totalDays; i++) {
      daysList.push({
        dateStr: currentStr,
        count: countMap[currentStr] || 0,
        isFuture: currentStr > todayStr,
      })
      currentStr = getOffsetDayStr(currentStr, 1)
    }

    // Group into 53 columns
    const cols: typeof daysList[] = []
    for (let i = 0; i < 53; i++) {
      cols.push(daysList.slice(i * 7, (i + 1) * 7))
    }

    // Calculate month labels
    const labels: { label: string; colIdx: number }[] = []
    let lastMonth = -1
    cols.forEach((col, colIdx) => {
      const firstDay = col[0]
      if (firstDay) {
        const d = new Date(firstDay.dateStr + 'T00:00:00Z')
        const month = d.getUTCMonth()
        if (month !== lastMonth) {
          const monthName = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
          // Avoid placing labels too close to each other
          if (labels.length === 0 || colIdx - labels[labels.length - 1].colIdx >= 3) {
            labels.push({ label: monthName, colIdx })
            lastMonth = month
          }
        }
      }
    })

    return { columns: cols, monthLabels: labels }
  }, [countMap])

  // Get CSS class based on entry count
  const getColorClass = (count: number, isFuture: boolean) => {
    if (isFuture) return 'bg-transparent border border-transparent'
    if (count === 0) return 'bg-secondary/40 border border-border/20 hover:border-muted-foreground/30'
    if (count === 1) return 'bg-accent/20 hover:bg-accent/30'
    if (count === 2) return 'bg-accent/45 hover:bg-accent/55'
    if (count === 3) return 'bg-accent/70 hover:bg-accent/80'
    return 'bg-accent hover:opacity-90'
  };

  return (
    <div className="bg-secondary/15 border border-border rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Activity Heatmap</h3>
        <span className="text-[11px] text-muted-foreground font-medium">Past 12 Months</span>
      </div>

      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[660px] flex flex-col gap-1.5 pt-4">
          
          {/* Month labels row */}
          <div className="relative h-4 text-[10px] text-muted-foreground font-medium select-none ml-8">
            {monthLabels.map(({ label, colIdx }) => (
              <span
                key={colIdx}
                className="absolute"
                style={{ left: `${colIdx * 12.2}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[2.5px]">
            {/* Day of week labels */}
            <div className="flex flex-col gap-[2.5px] pr-2 text-[9px] text-muted-foreground font-medium w-6 select-none leading-[9.5px] pt-[2.5px]">
              <span className="h-[9.5px]"></span>
              <span className="h-[9.5px]">Mon</span>
              <span className="h-[9.5px]"></span>
              <span className="h-[9.5px]">Wed</span>
              <span className="h-[9.5px]"></span>
              <span className="h-[9.5px]">Fri</span>
              <span className="h-[9.5px]"></span>
            </div>

            {/* Grid Columns */}
            <div className="flex gap-[2.5px] flex-1">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[2.5px]">
                  {col.map((day) => (
                    <div key={day.dateStr} className="relative group">
                      <div
                        className={`size-[9.5px] rounded-[1.5px] transition-colors duration-150 cursor-pointer ${getColorClass(
                          day.count,
                          day.isFuture
                        )}`}
                      />
                      
                      {/* Tooltip */}
                      {!day.isFuture && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none animate-fade-in">
                          <div className="bg-popover text-popover-foreground border border-border text-[10px] rounded-md px-2 py-1 whitespace-nowrap shadow-lg font-medium tracking-tight">
                            {day.count} {day.count === 1 ? 'entry' : 'entries'} on {formatDateLabel(day.dateStr)}
                          </div>
                          <div className="w-1.5 h-1.5 bg-popover border-r border-b border-border rotate-45 -mt-[4px]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground font-medium select-none pt-1">
        <span>Less</span>
        <div className="size-[9.5px] rounded-[1.5px] bg-secondary/40 border border-border/20" />
        <div className="size-[9.5px] rounded-[1.5px] bg-accent/20" />
        <div className="size-[9.5px] rounded-[1.5px] bg-accent/45" />
        <div className="size-[9.5px] rounded-[1.5px] bg-accent/70" />
        <div className="size-[9.5px] rounded-[1.5px] bg-accent" />
        <span>More</span>
      </div>
    </div>
  )
}
