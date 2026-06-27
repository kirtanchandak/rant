import { createClient } from '@/lib/supabase/server'
import { EntryCard } from '@/components/EntryCard'
import { ScrollText, PenLine } from 'lucide-react'
import Link from 'next/link'
import type { Entry } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Timeline' }

function getDateLabel(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

function groupByDay(entries: Entry[]) {
  const groups: { label: string; entries: Entry[] }[] = []
  let currentLabel = ''

  for (const entry of entries) {
    const label = getDateLabel(entry.created_at)
    if (label !== currentLabel) {
      groups.push({ label, entries: [entry] })
      currentLabel = label
    } else {
      groups[groups.length - 1].entries.push(entry)
    }
  }

  return groups
}

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const groups = groupByDay((entries as Entry[]) ?? [])

  if (!entries || entries.length === 0) {
    return (
      <div className="animate-fade-in py-24 text-center space-y-3">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-muted mb-2">
          <ScrollText className="size-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No entries yet</p>
        <p className="text-muted-foreground/70 text-xs">
          Your thoughts will appear here once you start writing.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition mt-2"
        >
          <PenLine className="size-3.5" />
          Write your first entry
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-center gap-2">
        <ScrollText className="size-5 text-muted-foreground" strokeWidth={1.8} />
        <h1 className="text-xl font-semibold text-foreground">Timeline</h1>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {groups.map((group) => (
        <section key={group.label}>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {group.label}
          </h2>
          <div>
            {group.entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
