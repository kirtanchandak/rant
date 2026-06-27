import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q) {
    return NextResponse.json({ entries: [] })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Full-text search using Supabase's textSearch
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .textSearch('content', q, {
      type: 'websearch',
      config: 'english',
    })
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    // Fall back to ilike if full-text search fails
    const { data: fallback } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .ilike('content', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ entries: fallback ?? [] })
  }

  return NextResponse.json({ entries: entries ?? [] })
}
