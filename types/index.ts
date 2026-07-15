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

export type OntologyType = 
  | 'person' | 'relationship' | 'organization' | 'company'
  | 'project' | 'goal' | 'skill' | 'task'
  | 'habit' | 'preference' | 'belief' | 'interest'
  | 'book' | 'movie' | 'music' | 'podcast' | 'game'
  | 'sport' | 'team' | 'athlete'
  | 'place' | 'country' | 'city' | 'location'
  | 'device' | 'vehicle' | 'product'
  | 'food' | 'drink' | 'restaurant'
  | 'event' | 'other'

export type Memory = {
  id: string
  user_id: string
  type: OntologyType
  name: string
  summary?: string
  metadata?: Record<string, any>
  status: 'proposed' | 'confirmed' | 'updated' | 'archived' | 'contradicted' | 'deleted'
  confidence: number
  first_seen: string
  last_seen: string
  mention_count: number
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  user_id: string
  name: string
  summary?: string
  event_date?: string
  confidence: number
  metadata?: Record<string, any>
  created_at: string
}

export type Relationship = {
  id: string
  user_id: string
  source_memory_id: string
  relation: string
  target_memory_id: string
  confidence: number
  created_at: string
}

export type EntryMood = {
  id: string
  entry_id: string
  user_id: string
  mood_score: number
  mood_label: string
  emotions: { emotion: string; intensity: number }[]
  summary: string
  created_at: string
}

export type MoodWithEntry = EntryMood & {
  entries: {
    created_at: string
    content: string
  }
}
