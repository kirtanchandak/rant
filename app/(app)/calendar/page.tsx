import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/CalendarView'
import { CalendarDays } from 'lucide-react'
import type { Entry } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Calendar' }

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: entries } = await supabase
    .from('entries')
    .select('id, user_id, content, created_at, updated_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-5 text-muted-foreground" strokeWidth={1.8} />
        <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
      </div>
      <CalendarView entries={(entries as Entry[]) ?? []} />
    </div>
  )
}
