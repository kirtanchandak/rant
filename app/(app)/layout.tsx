import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'there'

  const firstName = name.split(' ')[0]

  return (
    <>
      <NavBar userName={firstName} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>
      <Toaster position="bottom-right" />
    </>
  )
}
