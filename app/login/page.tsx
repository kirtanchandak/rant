'use client'

import { useActionState, useState } from 'react'
import { signIn, signUp } from '@/app/actions/auth'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Mail, User, Loader2, Sparkles, KeyRound } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  const [, loginAction, loginPending] = useActionState(async (_: unknown, formData: FormData) => {
    await signIn(formData)
    return null
  }, null)

  const [, signupAction, signupPending] = useActionState(async (_: unknown, formData: FormData) => {
    await signUp(formData)
    return null
  }, null)

  const pending = mode === 'login' ? loginPending : signupPending
  const action = mode === 'login' ? loginAction : signupAction

  return (
    <div className="animate-fade-in space-y-6">
      {hasError && (
        <p className="text-sm text-destructive text-center bg-destructive/10 rounded-md px-3 py-2">
          {hasError}
        </p>
      )}

      {/* Tabs */}
      <div className="flex bg-secondary p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            mode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
            mode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign up
        </button>
      </div>

      <form action={action} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1.5 animate-slide-up">
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
              required={mode === 'signup'}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60 transition"
            />
          </div>
        )}

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

        <div className="space-y-1.5">
          <label htmlFor="login-password" className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <KeyRound className="size-3" />
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/60 transition"
          />
        </div>

        <button
          id="submit-auth-btn"
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
        >
          {pending
            ? <><Loader2 className="size-4 animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
            : <><Sparkles className="size-4" /> {mode === 'login' ? 'Sign in' : 'Create account'}</>
          }
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center size-10 rounded-xl bg-accent/15 mb-2">
            <span className="text-xl">🍻</span>
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
