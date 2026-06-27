'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { Entry } from '@/types'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function CalendarView({ entries }: { entries: Entry[] }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Build a map of dates → entries
  const entryDates = new Map<string, Entry[]>()
  for (const entry of entries) {
    const d = new Date(entry.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!entryDates.has(key)) entryDates.set(key, [])
    entryDates.get(key)!.push(entry)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const atCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDate(null)
  }

  const selectedEntries = selectedDate ? (entryDates.get(selectedDate) ?? []) : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          id="prev-month-btn"
          onClick={prevMonth}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <h2 className="text-sm font-semibold text-foreground tabular-nums">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          id="next-month-btn"
          onClick={nextMonth}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
          disabled={atCurrentMonth}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground pb-2 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-px">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const hasEntries = entryDates.has(dateKey)
            const count = entryDates.get(dateKey)?.length ?? 0
            const isToday = day === now.getDate() && !!(year === now.getFullYear() && month === now.getMonth())
            const isSelected = dateKey === selectedDate

            return (
              <button
                key={dateKey}
                id={`cal-day-${dateKey}`}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                className={`relative flex flex-col items-center justify-center aspect-square rounded-lg text-xs sm:text-sm transition-all ${
                  isSelected
                    ? 'bg-accent text-accent-foreground font-semibold shadow-sm'
                    : isToday
                    ? 'bg-secondary text-foreground font-semibold ring-1 ring-accent/40'
                    : hasEntries
                    ? 'text-foreground hover:bg-secondary'
                    : 'text-muted-foreground/60 hover:bg-secondary/50'
                }`}
                aria-label={`${MONTH_NAMES[month]} ${day}${hasEntries ? `, ${count} ${count === 1 ? 'entry' : 'entries'}` : ''}`}
              >
                {day}
                {hasEntries && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      isSelected ? 'bg-accent-foreground/50' : 'bg-accent'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day entries */}
      {selectedDate && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {selectedEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                No entries on this day.
              </p>
            ) : (
              selectedEntries.map((entry, idx) => (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  id={`cal-entry-${entry.id}`}
                  className={`flex flex-col gap-1 px-4 py-3 hover:bg-secondary/50 transition-colors ${
                    idx < selectedEntries.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {new Date(entry.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit', hour12: true,
                    })}
                  </span>
                  <p className="text-sm text-foreground/80 line-clamp-2">
                    {entry.content.replace(/[#*`_~>]/g, '').slice(0, 160)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
