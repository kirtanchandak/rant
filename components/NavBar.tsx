'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/entries'
import { useTransition, useState } from 'react'
import { useTheme } from 'next-themes'
import {
  PenLine,
  ScrollText,
  CalendarDays,
  Search,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navLinks = [
  { href: '/',          label: 'Write',    icon: PenLine,      key: 'write' },
  { href: '/timeline',  label: 'Timeline', icon: ScrollText,   key: 'timeline' },
  { href: '/calendar',  label: 'Calendar', icon: CalendarDays, key: 'calendar' },
  { href: '/search',    label: 'Search',   icon: Search,       key: 'search' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      <Sun className="size-4 hidden dark:block" />
      <Moon className="size-4 block dark:hidden" />
    </button>
  )
}

export function NavBar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between gap-4">

        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-1 text-sm font-semibold text-foreground tracking-tight shrink-0"
          aria-label="Rant home"
        >
          <span className="text-xl">🍻</span>
          rant
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-0.5">
          {navLinks.map(({ href, label, icon: Icon, key }) => {
            const active = pathname === href
            return (
              <Link
                key={key}
                href={href}
                id={`nav-${key}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'text-foreground bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <Icon className="size-3.5" strokeWidth={2} />
                {label}
              </Link>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {/* Desktop: user + sign out */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground max-w-[100px] truncate">
              {userName}
            </span>
            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              disabled={isPending}
              title="Sign out"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            id="mobile-menu-btn"
            className="sm:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map(({ href, label, icon: Icon, key }) => {
            const active = pathname === href
            return (
              <Link
                key={key}
                href={href}
                id={`mobile-nav-${key}`}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'text-foreground bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                }`}
              >
                <Icon className="size-4" strokeWidth={2} />
                {label}
              </Link>
            )
          })}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground px-3">{userName}</span>
            <button
              onClick={() => { setMobileOpen(false); handleSignOut() }}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <LogOut className="size-3.5" />
              {isPending ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
