'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const name = formData.get('name') as string

  if (!email) throw new Error('Email is required')

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        full_name: name,
      },
    },
  })

  if (error) throw new Error(error.message)

  redirect(`/login?sent=true&email=${encodeURIComponent(email)}`)
}
