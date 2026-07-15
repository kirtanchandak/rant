import { Users, FolderKanban, Lightbulb, Target, Heart, Palette } from 'lucide-react'
import type { Memory } from '@/types'
import { MoodDistribution } from './MoodDistribution'

type PatternData = {
  topPeople: Memory[]
  activeProjects: Memory[]
  recurringIdeas: Memory[]
  goals: Memory[]
  moodDistribution: { great: number; good: number; meh: number; rough: number; total: number }
  topEmotions: { emotion: string; count: number }[]
}

export function PatternCards({ data }: { data: PatternData }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Top People */}
      <div className="bg-secondary/15 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Top People</h4>
          <span className="ml-auto text-[10px] text-muted-foreground/60 tabular-nums">
            {data.topPeople.length} tracked
          </span>
        </div>
        {data.topPeople.length > 0 ? (
          <div className="space-y-2">
            {data.topPeople.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="size-6 rounded-full bg-accent/15 flex items-center justify-center text-[10px] font-semibold text-accent shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-foreground truncate">{p.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
                  {p.mention_count}&times;
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No people detected yet.</p>
        )}
      </div>

      {/* Active Projects */}
      <div className="bg-secondary/15 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Active Projects</h4>
          <span className="ml-auto text-[10px] text-muted-foreground/60 tabular-nums">
            {data.activeProjects.length} active
          </span>
        </div>
        {data.activeProjects.length > 0 ? (
          <div className="space-y-2">
            {data.activeProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm text-foreground truncate">{p.name}</div>
                  {p.summary && (
                    <div className="text-[11px] text-muted-foreground/70 truncate">{p.summary}</div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
                  {p.mention_count}&times;
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No projects detected yet.</p>
        )}
      </div>

      {/* Recurring Ideas */}
      <div className="bg-secondary/15 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Recurring Ideas</h4>
        </div>
        {data.recurringIdeas.length > 0 ? (
          <div className="space-y-2">
            {data.recurringIdeas.map((idea) => (
              <div key={idea.id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-foreground truncate">{idea.name}</span>
                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
                  {idea.mention_count}&times;
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No ideas detected yet.</p>
        )}
      </div>

      {/* Goals */}
      <div className="bg-secondary/15 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Goals</h4>
        </div>
        {data.goals.length > 0 ? (
          <div className="space-y-2">
            {data.goals.map((goal) => {
              const firstSeen = new Date(goal.first_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              const lastSeen = new Date(goal.last_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <div key={goal.id} className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-foreground truncate">{goal.name}</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full tabular-nums shrink-0">
                      {goal.mention_count}&times;
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground/60">
                    {firstSeen} → {lastSeen}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No goals detected yet.</p>
        )}
      </div>

      {/* Mood Distribution */}
      <div className="bg-secondary/15 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Mood Distribution</h4>
        </div>
        {data.moodDistribution.total > 0 ? (
          <MoodDistribution data={data.moodDistribution} />
        ) : (
          <p className="text-xs text-muted-foreground/60">No mood data yet. Process your entries to see insights.</p>
        )}
      </div>

      {/* Emotional Palette */}
      <div className="bg-secondary/15 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold text-foreground">Emotional Palette</h4>
        </div>
        {data.topEmotions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.topEmotions.map(({ emotion, count }) => (
              <span
                key={emotion}
                className="inline-flex items-center gap-1 text-xs bg-accent/10 text-foreground px-2.5 py-1 rounded-full font-medium border border-accent/10"
              >
                {emotion}
                <span className="text-[10px] text-muted-foreground/70">{count}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/60">No emotions detected yet.</p>
        )}
      </div>
    </div>
  )
}
