'use client'

import { useState, useRef, useEffect, useCallback, useTransition } from 'react'
import { createEntry } from '@/app/actions/entries'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

export function EntryEditor({ greeting }: { greeting: string }) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastSavedRef = useRef('')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(ta.scrollHeight, 220)}px`
  }, [content])

  const handleSave = useCallback(
    (text: string) => {
      if (!text.trim() || text === lastSavedRef.current) return
      startTransition(async () => {
        try {
          await createEntry(text.trim())
          lastSavedRef.current = text
          setContent('')
          if (textareaRef.current) {
            textareaRef.current.style.height = '220px'
          }
          toast.success('Entry saved ✓')
        } catch {
          toast.error('Failed to save. Try again.')
        }
      })
    },
    []
  )

  // Autosave after 5s of inactivity
  useEffect(() => {
    if (!content.trim() || content === lastSavedRef.current) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(content)
    }, 5000)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [content, handleSave])

  // Cmd/Ctrl + Enter to save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave(content)
    }
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{greeting}</h1>
        <p className="text-muted-foreground mt-1 text-sm">What's on your mind today?</p>
      </div>

      {/* Editor area */}
      <div className="relative group">
        <textarea
          ref={textareaRef}
          id="entry-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Start writing…"
          className="rant-textarea"
          style={{ minHeight: '220px' }}
          aria-label="Journal entry"
          disabled={isPending}
        />
        {/* Subtle animated bottom line */}
        <div
          className="absolute bottom-0 left-0 h-px w-full transition-all duration-500"
          style={{
            background: content
              ? 'linear-gradient(to right, oklch(0.28 0.018 55 / 45%), oklch(0.28 0.018 55 / 5%))'
              : 'var(--border)',
          }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground/70 tabular-nums">
          {content.trim()
            ? `${wordCount} word${wordCount === 1 ? '' : 's'} · ⌘↵ to save`
            : 'Start writing to save'}
        </span>

        <button
          id="save-entry-btn"
          onClick={() => handleSave(content)}
          disabled={isPending || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending
            ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
            : <><Save className="size-3.5" /> Save</>
          }
        </button>
      </div>
    </div>
  )
}
