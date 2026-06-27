'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { updateEntry } from '@/app/actions/entries'
import { toast } from 'sonner'
import { Save, Loader2 } from 'lucide-react'

export function InlineEditor({
  id,
  initialContent,
  onCancel,
}: {
  id: string
  initialContent: string
  onCancel: () => void
}) {
  const [content, setContent] = useState(initialContent)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const len = content.length
    ref.current?.setSelectionRange(len, len)
  }, [])

  // Auto-resize
  useEffect(() => {
    const ta = ref.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [content])

  const handleSave = () => {
    if (!content.trim()) return
    startTransition(async () => {
      try {
        await updateEntry(id, content.trim())
        toast.success('Entry updated ✓')
      } catch {
        toast.error('Failed to update entry')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="space-y-4">
      <textarea
        ref={ref}
        id="inline-editor"
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10)
          }
        }}
        onKeyDown={handleKeyDown}
        className="rant-textarea"
        style={{ minHeight: '200px' }}
        disabled={isPending}
      />
      <div className="flex items-center gap-2">
        <button
          id="save-edit-btn"
          onClick={handleSave}
          disabled={isPending || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-40 transition shadow-sm"
        >
          {isPending
            ? <><Loader2 className="size-3.5 animate-spin" /> Saving…</>
            : <><Save className="size-3.5" /> Save changes</>
          }
        </button>
        <button
          id="cancel-edit-btn"
          onClick={onCancel}
          disabled={isPending}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-secondary"
        >
          Cancel
        </button>
        <span className="text-xs text-muted-foreground/60 ml-auto hidden sm:block">
          ⌘↵ to save · Esc to cancel
        </span>
      </div>
    </div>
  )
}
