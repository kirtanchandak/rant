'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { Search, Clock, Loader2 } from 'lucide-react'
import type { Entry } from '@/types'

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? `<mark class="bg-accent/20 text-foreground rounded px-0.5 not-italic">${part}</mark>`
      : part
  ).join('')
}

function getPreview(content: string, query: string, maxChars = 180): string {
  const clean = content.replace(/[#*`_~>]/g, '').trim()
  if (!query.trim()) return clean.slice(0, maxChars) + (clean.length > maxChars ? '…' : '')
  const lowerClean = clean.toLowerCase()
  const idx = lowerClean.indexOf(query.toLowerCase())
  if (idx === -1) return clean.slice(0, maxChars) + (clean.length > maxChars ? '…' : '')
  const start = Math.max(0, idx - 60)
  const end = Math.min(clean.length, idx + maxChars - 60)
  return (start > 0 ? '…' : '') + clean.slice(start, end) + (end < clean.length ? '…' : '')
}

export function SearchInterface() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Entry[]>([])
  const [searched, setSearched] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); setSearched(false); return }

    startTransition(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.entries ?? [])
        setSearched(true)
      }
    })
  }

  return (
    <div className="space-y-5">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search your entries…"
          className="w-full bg-card border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition"
          aria-label="Search journal entries"
        />
        {isPending && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* No results */}
      {searched && results.length === 0 && !isPending && (
        <div className="text-center py-12 space-y-2">
          <Search className="size-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            No results for &ldquo;<span className="text-foreground">{query}</span>&rdquo;
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="animate-slide-up">
          <p className="text-xs text-muted-foreground mb-3 tabular-nums">
            {results.length} result{results.length === 1 ? '' : 's'}
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {results.map((entry, idx) => {
              const preview = getPreview(entry.content, query)
              const highlighted = highlight(preview, query)
              return (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  id={`search-result-${entry.id}`}
                  className={`flex flex-col gap-1.5 px-4 py-3 hover:bg-secondary/50 transition-colors ${
                    idx < results.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3 shrink-0" />
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}{' '}
                    ·{' '}
                    {new Date(entry.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit', hour12: true,
                    })}
                  </span>
                  <p
                    className="text-sm text-foreground/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
