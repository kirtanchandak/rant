export type Entry = {
  id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  images?: string[]
}

export type User = {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    name?: string
  }
}
