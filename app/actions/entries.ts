'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEntry(content: string, images: string[] = []) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('entries')
    .insert({ content, user_id: user.id, images })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/timeline')
  revalidatePath('/calendar')
}

export async function updateEntry(id: string, content: string, images?: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const updateData: { content: string; images?: string[] } = { content }
  if (images !== undefined) {
    updateData.images = images
  }

  const { error } = await supabase
    .from('entries')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/timeline')
  revalidatePath(`/entries/${id}`)
}

export async function deleteEntry(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/timeline')
  revalidatePath('/calendar')
  redirect('/timeline')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
