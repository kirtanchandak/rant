import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/server'
import { DM_Serif_Display, JetBrains_Mono } from 'next/font/google'

const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'] })
const jetBrains = JetBrains_Mono({ weight: '500', subsets: ['latin'] })

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-background text-foreground animate-fade-in">

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-background/80 backdrop-blur-md border-b border-border">
        <Link href="/" className={`text-xl ${dmSerif.className} text-foreground flex items-center gap-2`}>
          <span className="text-2xl">🍻</span> rant
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ul className="hidden md:flex items-center gap-6 list-none">
            <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
            <li><a href="#ask" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ask your journal</a></li>
          </ul>
          <ThemeToggle />
          <Link
            href={isLoggedIn ? "/write" : "/login"}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {isLoggedIn ? "Go to app" : "Start free"}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-4 sm:px-6 py-20 sm:py-28 md:py-36 text-center max-w-4xl mx-auto">
        <h1 className={`text-4xl sm:text-5xl md:text-7xl mb-5 sm:mb-6 text-foreground leading-[1.1] tracking-tight ${dmSerif.className}`}>
          The journal that<br/>actually <span className="inline-block bg-[#ff4d00]/15 px-2 pb-1 rounded-md text-[#ff4d00] italic">remembers</span> you.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8 sm:mb-10 leading-relaxed">
          Write freely. Your journal builds a searchable memory of your life — people, ideas, moods, goals — automatically.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link href={isLoggedIn ? "/write" : "/login"} className="w-full sm:w-auto px-6 py-3.5 bg-foreground text-background font-semibold rounded-xl text-[15px] hover:opacity-90 transition-opacity text-center">
            {isLoggedIn ? "Go to app →" : "Start writing free →"}
          </Link>
          <a href="#features" className="w-full sm:w-auto px-6 py-3.5 bg-background text-foreground border border-border font-medium rounded-xl text-[15px] hover:border-muted-foreground transition-colors text-center">
            How it works
          </a>
        </div>
      </section>

      {/* PILLS */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 text-center border-b border-border">
        <div className="text-[11px] tracking-widest uppercase text-muted-foreground mb-5 font-medium">Tracks everything you write about</div>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {["👤 People", "💡 Ideas", "🎯 Goals", "😊 Moods", "🛠️ Projects", "📸 Images", "🔄 Patterns"].map(pill => (
            <div key={pill} className="bg-background border border-border rounded-full px-4 py-1.5 sm:px-5 sm:py-2 text-sm font-medium text-foreground flex items-center gap-2 shadow-sm">
              {pill}
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 text-center sm:text-left">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><span>✍️</span> Write anything, no templates</div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><span>🔒</span> Private by default</div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><span>⚡</span> AI that works quietly in the background</div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 border-y border-border">
        {[
          { num: "∞", label: "Entries you can write" },
          { num: "24h", label: "Memory processing" },
          { num: "100%", label: "Your data, always" },
          { num: "0", label: "Organising required" },
        ].map((stat, i) => (
          <div key={i} className="text-center py-8 sm:py-12 border-b border-border md:border-b-0 border-r last:border-r-0 [&:nth-child(2)]:border-r md:[&:nth-child(2)]:border-r [&:nth-child(even)]:border-r-0 md:[&:nth-child(even)]:border-r">
            <div className={`text-3xl sm:text-4xl md:text-5xl text-foreground mb-1 ${dmSerif.className}`}>{stat.num}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest px-2">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* FEATURES INTRO */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-10 sm:pb-16 text-center md:text-left">
        <div className={`text-[10px] uppercase tracking-[0.18em] text-[#ff4d00] mb-4 sm:mb-5 font-medium ${jetBrains.className}`}>What rant does</div>
        <h2 className={`text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-[1.1] ${dmSerif.className}`}>
          Not another journaling app.<br className="hidden md:block"/> A personal intelligence system.
        </h2>
        <p className="text-base sm:text-[17px] text-muted-foreground max-w-2xl leading-[1.75] font-light mx-auto md:mx-0">
          Most journals are write-only. Rant reads back. Every entry feeds a memory layer that connects people, projects, ideas, and moods — so your past self can actually help your present self.
        </p>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[1px] bg-border border border-border rounded-xl overflow-hidden">
          {[
            { icon: "🧠", title: "Memory layer", desc: "Remembers people, projects, habits, and ideas. Connects related entries across weeks and months. Never loses context." },
            { icon: "💬", title: "Ask your journal", desc: "\"What was I working on in March?\" Chat naturally with your memories instead of scrolling through hundreds of entries." },
            { icon: "📈", title: "Auto-reviews", desc: "Weekly summaries, monthly highlights, quarterly reviews — written automatically. Understand what happened without rereading everything." },
            { icon: "😊", title: "Mood timeline", desc: "AI detects emotional patterns over time. Discover what makes you happiest, stressful periods, and burnout signals before they hit." },
            { icon: "🎯", title: "Goal tracking", desc: "Mention a goal once. AI tracks progress automatically every time you reference it again — no manual checklists." },
            { icon: "💡", title: "Idea tracking", desc: "AI groups similar ideas and tells you which ones resurface, which evolved, and which you've quietly abandoned." },
            { icon: "🔍", title: "Semantic search", desc: "Search by meaning, not keywords. Find \"the project where I was excited about AI agents\" without remembering exact words." },
            { icon: "📸", title: "Images with context", desc: "Upload screenshots, whiteboards, photos. AI understands text and images together — your visual memories become searchable." },
            { icon: "🌙", title: "Nightly intelligence", desc: "Every night, your journal gets smarter. AI updates memory, themes, goals, mood, projects, and relationships. No manual work." },
          ].map((f, i) => (
            <div key={i} className="bg-background p-6 sm:p-8 transition-colors hover:bg-secondary">
              <span className="text-2xl block mb-3 sm:mb-4">{f.icon}</span>
              <h3 className={`text-lg sm:text-xl text-foreground mb-2 ${dmSerif.className}`}>{f.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MEMORY VISUAL */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-20 items-center">
          <div>
            <div className={`text-[10px] uppercase tracking-[0.18em] text-[#ff4d00] mb-4 sm:mb-5 font-medium ${jetBrains.className}`}>Memory layer</div>
            <h2 className={`text-3xl sm:text-4xl text-foreground mb-4 leading-[1.1] ${dmSerif.className}`}>Your journal remembers everything.</h2>
            <p className="text-base sm:text-[17px] text-muted-foreground leading-[1.75] font-light">
              Every entry is understood, tagged, and connected — automatically building a map of your life.
            </p>
          </div>
          <div className={`bg-secondary/30 border border-border rounded-xl p-4 sm:p-6 text-xs leading-loose ${jetBrains.className}`}>
            {[
              { time: "3 days ago", text: "Started working on the AI memory layer", tag: "project" },
              { time: "1 week ago", text: "Met Rahul for coffee, he's joining a startup", tag: "person" },
              { time: "2 weeks ago", text: "Feeling burnt out from context switching", tag: "mood" },
              { time: "1 month ago", text: "Had the idea for a journaling app with memory", tag: "idea" },
              { time: "2 months ago", text: "Goal: ship an MVP in 30 days", tag: "goal" },
            ].map((m, i) => (
              <div key={i} className="flex gap-2 sm:gap-3 items-center py-2 border-b border-border last:border-0 text-muted-foreground">
                <span className="text-[10px] sm:text-[11px] min-w-[60px] sm:min-w-[70px] opacity-70 shrink-0">{m.time}</span>
                <span className="flex-1 truncate text-[11px] sm:text-xs">{m.text}</span>
                <span className="text-[9px] bg-[#ff4d00]/10 text-[#ff4d00] px-1.5 sm:px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">{m.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-border max-w-5xl mx-auto"></div>

      {/* ASK */}
      <section id="ask" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-12 md:gap-20 items-center">
          <div className="bg-secondary/30 border border-border rounded-xl overflow-hidden flex flex-col h-[360px] sm:h-[400px]">
            <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-border text-[13px] text-muted-foreground shrink-0">💬 Ask your journal</div>
            <div className="flex-1 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 overflow-y-auto">
              <div className="max-w-[88%] text-[12px] sm:text-[13px] leading-relaxed px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary text-foreground self-end rounded-2xl rounded-tr-sm">
                When did I first mention my startup idea?
              </div>
              <div className="max-w-[88%] text-[12px] sm:text-[13px] leading-relaxed px-3 sm:px-4 py-2.5 sm:py-3 bg-[#ff4d00]/10 text-foreground border border-[#ff4d00]/20 self-start rounded-2xl rounded-tl-sm">
                2 months ago — right after feeling frustrated that Notion wasn't capturing the right kind of thinking. You've referenced it 14 times since.
              </div>
              <div className="max-w-[88%] text-[12px] sm:text-[13px] leading-relaxed px-3 sm:px-4 py-2.5 sm:py-3 bg-secondary text-foreground self-end rounded-2xl rounded-tr-sm">
                Show every time I felt burnt out
              </div>
              <div className="max-w-[88%] text-[12px] sm:text-[13px] leading-relaxed px-3 sm:px-4 py-2.5 sm:py-3 bg-[#ff4d00]/10 text-foreground border border-[#ff4d00]/20 self-start rounded-2xl rounded-tl-sm">
                Found 3 entries. Pattern: burnout follows stretches of context switching. The last time was 2 weeks ago after jumping between 4 tasks in one week.
              </div>
            </div>
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-border flex items-center gap-3 shrink-0">
              <span className="flex-1 text-xs text-muted-foreground/60">Ask anything about your life...</span>
              <div className="w-7 h-7 bg-[#ff4d00] rounded-md flex items-center justify-center text-white text-sm shrink-0">↑</div>
            </div>
          </div>
          <div className="order-first md:order-last">
            <div className={`text-[10px] uppercase tracking-[0.18em] text-[#ff4d00] mb-4 sm:mb-5 font-medium ${jetBrains.className}`}>Ask your journal</div>
            <h2 className={`text-3xl sm:text-4xl text-foreground mb-4 leading-[1.1] ${dmSerif.className}`}>Talk to your past self.</h2>
            <p className="text-base sm:text-[17px] text-muted-foreground leading-[1.75] font-light">
              Your journal has context you've forgotten. Ask it anything — answers grounded in what you actually wrote.
            </p>
          </div>
        </div>
      </section>

      {/* MOOD */}
      <section className="bg-secondary/30 border-y border-border py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`text-[10px] uppercase tracking-[0.18em] text-[#ff4d00] mb-4 sm:mb-5 font-medium ${jetBrains.className}`}>Mood timeline</div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl text-foreground mb-4 leading-[1.1] ${dmSerif.className}`}>Emotional patterns you'd never notice yourself.</h2>
          <p className="text-base sm:text-[17px] text-muted-foreground max-w-2xl leading-[1.75] font-light">
            AI detects tone in every entry. See what weeks went great, when stress crept in, and what correlates with your best days.
          </p>
          <div className="flex gap-1 sm:gap-1.5 md:gap-2 mt-10 sm:mt-12 items-end h-[80px] sm:h-[100px] overflow-hidden">
            {[85,70,75,45,30,25,50,65,90,80,72,88,40,68,92,76,48,28,62,84,95,73,69,87,44,32,66,91].map((h, i) => {
              let color = '#27c93f'
              if (h < 40) color = '#ff4d00'
              else if (h < 60) color = '#ffbd2e'
              else if (h < 80) color = '#4a9eff'
              return (
                <div key={i} className="flex-1 rounded-t-sm opacity-90 hover:opacity-100 transition-opacity cursor-pointer" style={{ height: `${h}%`, backgroundColor: color }}></div>
              )
            })}
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-[#27c93f]"></div>Great</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-[#4a9eff]"></div>Good</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-[#ffbd2e]"></div>Meh</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><div className="w-2.5 h-2.5 rounded-sm bg-[#ff4d00]"></div>Rough</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 text-center max-w-2xl mx-auto">
        <h2 className={`text-3xl sm:text-4xl md:text-6xl text-foreground mb-4 sm:mb-5 leading-[1.1] ${dmSerif.className}`}>
          Stop losing yourself<br/>to the scroll.
        </h2>
        <p className="text-base sm:text-[17px] text-muted-foreground mb-8 sm:mb-10 font-light">Your thoughts deserve better than a Notes app.</p>
        <Link
          href={isLoggedIn ? "/write" : "/login"}
          className="inline-block px-6 sm:px-8 py-3.5 sm:py-4 bg-foreground text-background font-semibold rounded-xl text-[15px] hover:opacity-90 transition-opacity"
        >
          {isLoggedIn ? "Go to app" : "Start for free — no card needed"}
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 sm:py-10 px-4 sm:px-8 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className={`text-lg text-muted-foreground/60 ${dmSerif.className}`}>🍻 rant</div>
        <ul className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 list-none">
          {["Privacy", "Terms", "Twitter", "Contact"].map(l => (
            <li key={l}><a href="#" className="text-[13px] text-muted-foreground/80 hover:text-foreground transition-colors">{l}</a></li>
          ))}
        </ul>
      </footer>
    </div>
  )
}
