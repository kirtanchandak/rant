'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { deleteEntry } from '@/app/actions/entries'
import { toast } from 'sonner'
import { Pencil, Trash2, Clock, Image as ImageIcon } from 'lucide-react'
import type { Entry } from '@/types'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getPreview(content: string, maxChars = 200) {
  const clean = content.replace(/[#*`_~>]/g, '').trim()
  return clean.length > maxChars ? clean.slice(0, maxChars) + '…' : clean
}

export function EntryCard({ entry }: { entry: Entry }) {
  const [isPending, startTransition] = useTransition()
  const hasImages = entry.images && entry.images.length > 0

  const handleDelete = () => {
    if (!confirm('Delete this entry?')) return
    startTransition(async () => {
      try {
        await deleteEntry(entry.id)
        toast.success('Entry deleted')
      } catch {
        toast.error('Failed to delete entry')
      }
    })
  }

  return (
    <article
      className="group animate-fade-in py-4 border-b border-border last:border-0"
      aria-label={`Entry from ${formatTime(entry.created_at)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/entries/${entry.id}`}
          id={`entry-${entry.id}`}
          className="flex-1 min-w-0 flex items-start gap-4 hover:opacity-75 transition-opacity"
        >
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3 shrink-0" strokeWidth={2} />
              {formatTime(entry.created_at)}
              {hasImages && (
                <span className="flex items-center gap-1 ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full text-foreground/75 font-medium">
                  <ImageIcon className="size-2.5" />
                  {entry.images!.length}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4 whitespace-pre-wrap break-words">
              {getPreview(entry.content)}
            </p>
          </div>

          {hasImages && (
            <div className="size-14 rounded-lg overflow-hidden border border-border shrink-0 bg-secondary/30 mt-1">
              <img
                src={entry.images![0]}
                alt="Entry thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </Link>

        {/* Actions — show on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
          <Link
            href={`/entries/${entry.id}?edit=1`}
            id={`edit-entry-${entry.id}`}
            title="Edit"
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
          >
            <Pencil className="size-3.5" />
          </Link>
          <button
            id={`delete-entry-${entry.id}`}
            onClick={handleDelete}
            disabled={isPending}
            title="Delete"
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader /> : <Trash2 className="size-3.5" />}
          </button>
        </div>
      </div>
    </article>
  )
}

function Loader() {
  return (
    <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}
