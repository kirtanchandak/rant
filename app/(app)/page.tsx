import { createClient } from '@/lib/supabase/server'
import { EntryEditor } from '@/components/EntryEditor'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Write' }

function getGreeting(name: string) {
  const hour = new Date().getHours()
  const timeOfDay =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  return `Good ${timeOfDay}, ${name}.`
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there'

  const firstName = name.split(' ')[0]
  const greeting = getGreeting(firstName)

  return <EntryEditor greeting={greeting} />
}
