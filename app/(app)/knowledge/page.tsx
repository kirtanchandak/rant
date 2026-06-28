import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Memory } from '@/types'
import { Network, PenLine } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Knowledge — Rant' }

const ONTOLOGY_GROUPS: Record<string, string[]> = {
  'People':        ['person', 'relationship'],
  'Organizations': ['organization', 'company'],
  'Work':          ['project', 'goal', 'skill', 'task'],
  'Lifestyle':     ['habit', 'preference', 'belief', 'interest'],
  'Entertainment': ['book', 'movie', 'music', 'podcast', 'game'],
  'Sports':        ['sport', 'team', 'athlete'],
  'Places':        ['place', 'country', 'city', 'location'],
  'Devices':       ['device', 'vehicle', 'product'],
  'Food':          ['food', 'drink', 'restaurant'],
}

const STATUS_LABEL: Record<string, string> = {
  proposed:     'proposed',
  confirmed:    'confirmed',
  updated:      'updated',
  archived:     'archived',
  contradicted: 'contradicted',
}

export default async function KnowledgePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .order('mention_count', { ascending: false })

  const allMemories: Memory[] = memories ?? []

  // Group memories by ontology
  const grouped: Record<string, Memory[]> = {}
  Object.keys(ONTOLOGY_GROUPS).forEach(k => { grouped[k] = [] })
  grouped['Other'] = []

  allMemories.forEach(m => {
    let placed = false
    for (const [group, types] of Object.entries(ONTOLOGY_GROUPS)) {
      if (types.includes(m.type)) { grouped[group].push(m); placed = true; break }
    }
    if (!placed) grouped['Other'].push(m)
  })

  const activeGroups = Object.entries(grouped).filter(([, items]) => items.length > 0)

  if (allMemories.length === 0) {
    return (
      <div className="animate-fade-in py-24 text-center space-y-3">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-muted mb-2">
          <Network className="size-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No memories yet</p>
        <p className="text-muted-foreground/70 text-xs max-w-xs mx-auto">
          Write detailed journal entries and the AI will automatically extract entities into your knowledge graph.
        </p>
        <Link
          href="/write"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:opacity-80 transition mt-2"
        >
          <PenLine className="size-3.5" />
          Write an entry
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in">

      {/* Page header — same style as Timeline */}
      <div className="flex items-center gap-2">
        <Network className="size-5 text-muted-foreground" strokeWidth={1.8} />
        <h1 className="text-xl font-semibold text-foreground">Knowledge</h1>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {allMemories.length} {allMemories.length === 1 ? 'memory' : 'memories'}
        </span>
      </div>

      {activeGroups.map(([groupName, items]) => (
        <section key={groupName} className="space-y-1">

          {/* Section label — same style as timeline date headers */}
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            {groupName} · {items.length}
          </h2>

          {/* Row list */}
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {items.map((memory, idx) => (
              <div
                key={memory.id}
                className="flex items-start gap-4 px-4 py-3.5 bg-card hover:bg-secondary/40 transition-colors"
              >
                {/* Left: type pill */}
                <span className="mt-0.5 shrink-0 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                  {memory.type}
                </span>

                {/* Middle: name + summary */}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug truncate">
                    {memory.name}
                  </p>
                  {memory.summary && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {memory.summary}
                    </p>
                  )}
                </div>

                {/* Right: mention count */}
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums font-medium">
                  {memory.mention_count}×
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
