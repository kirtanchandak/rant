import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import NextTopLoader from 'nextjs-toploader'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: 'Rant — Frictionless Journal', template: '%s · Rant' },
  description: 'Rant is a warm, frictionless daily journal. Open, write, save, leave. Zero distractions, beautiful cream aesthetic.',
  keywords: ['journaling', 'notes', 'private thoughts', 'minimalist journal', 'writing app', 'rant', 'personal data'],
  authors: [{ name: 'Kirtan' }],
  creator: 'Kirtan',
  robots: {
    index: false,
    follow: false,
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f6f2' },
    { media: '(prefers-color-scheme: dark)', color: '#171616' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents zooming on inputs in iOS Safari
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextTopLoader
          color="oklch(0.55 0.08 55)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow={false}
          zIndex={9999}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
