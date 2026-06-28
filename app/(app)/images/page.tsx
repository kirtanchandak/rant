import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Images, PenLine } from 'lucide-react'
import Link from 'next/link'
import { ImageGrid } from '@/components/ImageGrid'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Images — Rant' }

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

export default async function ImagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: entries } = await supabase
    .from('entries')
    .select('id, content, images, created_at')
    .eq('user_id', user.id)
    .not('images', 'is', null)
    .order('created_at', { ascending: false })

  // Flatten all images, preserving entry date
  const allImages = (entries ?? [])
    .filter(e => e.images && e.images.length > 0)
    .flatMap(e =>
      e.images.map((url: string) => ({
        url,
        entryId: e.id,
        entryDate: e.created_at,
        entrySnippet: e.content?.slice(0, 120).trim() || 'Journal entry',
      }))
    )

  const totalPhotos = allImages.length
  const totalEntries = (entries ?? []).filter(e => e.images && e.images.length > 0).length

  if (allImages.length === 0) {
    return (
      <div className="animate-fade-in py-24 text-center space-y-3">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-muted mb-2">
          <Images className="size-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No images yet</p>
        <p className="text-muted-foreground/70 text-xs max-w-xs mx-auto">
          Attach photos, screenshots or whiteboards to your journal entries and they'll appear here.
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

  // Group images by day label
  const groups: { label: string; images: typeof allImages }[] = []
  let currentLabel = ''

  for (const img of allImages) {
    const label = getDateLabel(img.entryDate)
    if (label !== currentLabel) {
      groups.push({ label, images: [img] })
      currentLabel = label
    } else {
      groups[groups.length - 1].images.push(img)
    }
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Images className="size-5 text-muted-foreground" strokeWidth={1.8} />
        <h1 className="text-xl font-semibold text-foreground">Images</h1>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'} · {totalEntries} {totalEntries === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Date-grouped sections */}
      {groups.map(group => (
        <section key={group.label} className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {group.label}
          </h2>
          <ImageGrid images={group.images} />
        </section>
      ))}
    </div>
  )
}
