import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Rant — Frictionless Journal',
    short_name: 'Rant',
    description: 'A warm, frictionless daily journal. Open, write, save, leave.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f6f2',
    theme_color: '#f7f6f2',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
    shortcuts: [
      {
        name: 'New Rant',
        short_name: 'Write',
        description: 'Write a new journal entry',
        url: '/',
      },
      {
        name: 'Search Entries',
        short_name: 'Search',
        description: 'Search your journal entries',
        url: '/search',
      },
      {
        name: 'Timeline',
        short_name: 'Timeline',
        description: 'View your journal timeline',
        url: '/timeline',
      }
    ],
  }
}
