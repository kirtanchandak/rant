'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEntry } from '@/app/actions/entries'
import { InlineEditor } from '@/components/InlineEditor'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'
import { Pencil, Trash2, Loader2, X } from 'lucide-react'
import type { Entry } from '@/types'

export function EntryView({ entry, startEditing }: { entry: Entry; startEditing: boolean }) {
  const [editing, setEditing] = useState(startEditing)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
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
          initialImages={entry.images}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className="space-y-6">
          <div className="rant-prose text-base">
            <ReactMarkdown>{entry.content}</ReactMarkdown>
          </div>

          {/* Attached Images Grid */}
          {entry.images && entry.images.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-6 animate-fade-in">
              {entry.images.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxUrl(url)}
                  className="relative aspect-video rounded-xl overflow-hidden border border-border cursor-pointer group bg-secondary/30"
                >
                  <img
                    src={url}
                    alt={`Attached image ${idx + 1}`}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90dvh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <img
              src={lightboxUrl}
              alt="Lightbox view"
              className="max-w-full max-h-[90dvh] object-contain"
            />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md transition hover:bg-black/60"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
