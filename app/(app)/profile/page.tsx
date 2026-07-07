import { createClient } from '@/lib/supabase/server'
import { ContributionGraph } from '@/components/ContributionGraph'
import { User, Flame, Trophy, BookOpen, Sparkles, Clock, Calendar } from 'lucide-react'
import type { Entry } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile' }

function getNextDayStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().split('T')[0]
}

function getPreviousDayStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]
}

function getStreakStats(entries: Entry[]) {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalEntries: 0, avgWords: 0 }
  }

  // Get unique local dates (YYYY-MM-DD), sorted descending
  const localDates = Array.from(
    new Set(
      entries.map((e) => {
        const d = new Date(e.created_at)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      })
    )
  ).sort((a, b) => b.localeCompare(a))

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterdayStr = getPreviousDayStr(todayStr)

  const hasToday = localDates.includes(todayStr)
  const hasYesterday = localDates.includes(yesterdayStr)

  if (hasToday || hasYesterday) {
    let checkStr = hasToday ? todayStr : yesterdayStr
    while (localDates.includes(checkStr)) {
      currentStreak++
      checkStr = getPreviousDayStr(checkStr)
    }
  }

  // Calculate longest streak
  const sortedDatesAsc = [...localDates].sort((a, b) => a.localeCompare(b))
  if (sortedDatesAsc.length > 0) {
    longestStreak = 1
    tempStreak = 1
    for (let i = 1; i < sortedDatesAsc.length; i++) {
      const prev = sortedDatesAsc[i - 1]
      const curr = sortedDatesAsc[i]
      const expectedNext = getNextDayStr(prev)

      if (curr === expectedNext) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)
  }

  // Calculate average words
  let totalWords = 0
  entries.forEach((e) => {
    totalWords += e.content.trim() ? e.content.trim().split(/\s+/).length : 0
  })
  const avgWords = Math.round(totalWords / entries.length)

  return {
    currentStreak,
    longestStreak,
    totalEntries: entries.length,
    avgWords,
  }
}

function getInsights(entries: Entry[]) {
  if (entries.length === 0) {
    return { favoriteDay: 'N/A', favoriteTime: 'N/A' }
  }

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayCounts = Array(7).fill(0)
  
  const timeCounts = {
    Morning: 0,   // 5:00 - 11:59
    Afternoon: 0, // 12:00 - 16:59
    Evening: 0,   // 17:00 - 21:59
    Night: 0      // 22:00 - 4:59
  }

  entries.forEach(e => {
    const d = new Date(e.created_at)
    dayCounts[d.getDay()]++

    const hour = d.getHours()
    if (hour >= 5 && hour < 12) {
      timeCounts.Morning++
    } else if (hour >= 12 && hour < 17) {
      timeCounts.Afternoon++
    } else if (hour >= 17 && hour < 22) {
      timeCounts.Evening++
    } else {
      timeCounts.Night++
    }
  })

  // Find max day
  let maxDayIdx = 0
  let maxDayCount = -1
  dayCounts.forEach((cnt, idx) => {
    if (cnt > maxDayCount) {
      maxDayCount = cnt
      maxDayIdx = idx
    }
  })
  const favoriteDay = maxDayCount > 0 ? daysOfWeek[maxDayIdx] : 'N/A'

  // Find max time period
  let favoriteTime = 'N/A'
  let maxTimeCount = -1
  Object.entries(timeCounts).forEach(([period, cnt]) => {
    if (cnt > maxTimeCount) {
      maxTimeCount = cnt
      favoriteTime = period
    }
  })

  return { favoriteDay, favoriteTime }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch entries
  const { data: entriesData } = await supabase
    .from('entries')
    .select('id, created_at, content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  const entries = (entriesData as Entry[]) ?? []
  
  const stats = getStreakStats(entries)
  const insights = getInsights(entries)

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'
  const firstName = name.split(' ')[0]
  const initials = name
    .split(' ')
    .map((n: string) => n[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase()

  const joinedDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header title */}
      <div className="flex items-center gap-2">
        <User className="size-5 text-muted-foreground" strokeWidth={1.8} />
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
      </div>

      {/* User Info Card */}
      <div className="bg-secondary/15 border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="size-16 rounded-2xl bg-gradient-to-br from-accent/25 to-accent flex items-center justify-center text-accent-foreground font-semibold text-xl tracking-wide shrink-0 shadow-sm border border-accent/20">
          {initials}
        </div>
        <div className="text-center sm:text-left space-y-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground truncate">{name}</h2>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground/80 pt-1">
            <Calendar className="size-3.5" />
            <span>Member since {joinedDate}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Rants */}
        <div className="bg-secondary/10 hover:bg-secondary/20 transition border border-border rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total Entries</span>
            <BookOpen className="size-4 text-muted-foreground/75" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {stats.totalEntries}
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-secondary/10 hover:bg-secondary/20 transition border border-border rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Current Streak</span>
            <Flame className={`size-4 ${stats.currentStreak > 0 ? 'text-[#ff4d00]' : 'text-muted-foreground/75'}`} />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-secondary/10 hover:bg-secondary/20 transition border border-border rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Longest Streak</span>
            <Trophy className="size-4 text-muted-foreground/75" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
          </div>
        </div>

        {/* Average Words */}
        <div className="bg-secondary/10 hover:bg-secondary/20 transition border border-border rounded-xl p-4.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Avg. Words</span>
            <Sparkles className="size-4 text-muted-foreground/75" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {stats.avgWords}
          </div>
        </div>
      </div>

      {/* Heatmap / Contribution Graph */}
      <ContributionGraph entries={entries} />

      {/* Insights Section */}
      <div className="bg-secondary/15 border border-border rounded-xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Writing Insights</h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 bg-secondary/10 border border-border/50 rounded-lg p-4">
            <Calendar className="size-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-medium">Most Active Day</div>
              <div className="text-sm font-semibold text-foreground">
                {insights.favoriteDay}
              </div>
              <p className="text-xs text-muted-foreground/70">
                You publish more entries on this day than any other.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-secondary/10 border border-border/50 rounded-lg p-4">
            <Clock className="size-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-medium">Preferred Time</div>
              <div className="text-sm font-semibold text-foreground">
                {insights.favoriteTime}
              </div>
              <p className="text-xs text-muted-foreground/70">
                Most of your entries are written during this part of the day.
              </p>
            </div>
          </div>
        </div>

        {entries.length > 0 && (
          <p className="text-xs text-muted-foreground/80 italic pt-2 text-center">
            &ldquo;Keep it up, {firstName}! Every entry strengthens your journal&apos;s memory layer.&rdquo;
          </p>
        )}
      </div>

    </div>
  )
}
