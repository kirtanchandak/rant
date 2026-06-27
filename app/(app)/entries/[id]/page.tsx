import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { EntryView } from '@/components/EntryView'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Entry } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Entry' }

export default async function EntryPage(props: PageProps<'/entries/[id]'>) {
  const { id } = await props.params
  const searchParams = await props.searchParams
  const startEditing = searchParams?.edit === '1'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!data) notFound()

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/timeline"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
        Timeline
      </Link>
      <EntryView entry={data as Entry} startEditing={startEditing ?? false} />
    </div>
  )
}
