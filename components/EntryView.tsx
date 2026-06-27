'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEntry } from '@/app/actions/entries'
import { InlineEditor } from '@/components/InlineEditor'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import type { Entry } from '@/types'

export function EntryView({ entry, startEditing }: { entry: Entry; startEditing: boolean }) {
  const [editing, setEditing] = useState(startEditing)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    if (!confirm('Delete this entry permanently?')) return
    startTransition(async () => {
      try {
        await deleteEntry(entry.id)
        toast.success('Entry deleted')
        router.push('/timeline')
      } catch {
        toast.error('Failed to delete entry')
      }
    })
  }

  const formattedDate = new Date(entry.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = new Date(entry.created_at).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-foreground">{formattedDate}</div>
          <div className="text-xs text-muted-foreground mt-0.5">📍 {formattedTime}</div>
        </div>
        {!editing && (
          <div className="flex items-center gap-1">
            <button
              id="edit-btn"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition px-3 py-1.5 rounded-md hover:bg-secondary"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
            <button
              id="delete-btn"
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition px-3 py-1.5 rounded-md hover:bg-secondary disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              {isPending ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Content */}
      {editing ? (
        <InlineEditor
          id={entry.id}
          initialContent={entry.content}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="rant-prose text-base">
          <ReactMarkdown>{entry.content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
