import { SearchInterface } from '@/components/SearchInterface'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Search' }

export default function SearchPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Search className="size-5 text-muted-foreground" strokeWidth={1.8} />
        <h1 className="text-xl font-semibold text-foreground">Search</h1>
      </div>
      <SearchInterface />
    </div>
  )
}
