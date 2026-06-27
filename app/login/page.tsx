'use client'

import { useActionState } from 'react'
import { sendMagicLink } from '@/app/actions/auth'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Mail, User, Loader2, Sparkles } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const sent = searchParams.get('sent')
  const email = searchParams.get('email')
  const hasError = searchParams.get('error')

  const [, action, pending] = useActionState(async (_: unknown, formData: FormData) => {
    await sendMagicLink(formData)
    return null
  }, null)

  if (sent) {
    return (
      <div className="animate-fade-in text-center space-y-4 py-2">
        <div className="text-4xl">✉️</div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Check your inbox</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Magic link sent to{' '}
            <span className="text-foreground font-medium">{email}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Click the link to sign in. You can close this tab.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4 animate-fade-in">
      {hasError && (
        <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md px-3 py-2">
          That link expired or is invalid. Try again.
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="login-name" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <User className="size-3" />
          Your name
        </label>
        <input
          id="login-name"
          name="name"
          type="text"
          placeholder="Kirtan"
          autoFocus
          autoComplete="given-name"
          required
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60 transition"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <Mail className="size-3" />
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60 transition"
        />
      </div>

      <button
        id="send-magic-link-btn"
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
      >
        {pending
          ? <><Loader2 className="size-4 animate-spin" /> Sending…</>
          : <><Sparkles className="size-4" /> Send magic link</>
        }
      </button>

      <p className="text-xs text-muted-foreground text-center">
        No password. We'll email you a sign-in link.
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center size-10 rounded-xl bg-accent/15 mb-2">
            <span className="text-xl">📓</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">rant</h1>
          <p className="text-sm text-muted-foreground">
            Your private space to think out loud.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-muted-foreground/60">
          No tracking. No ads. Just your thoughts.
        </p>
      </div>
    </main>
  )
}
