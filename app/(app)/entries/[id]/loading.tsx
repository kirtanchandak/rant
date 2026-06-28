export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-secondary/60" />
        <div className="h-4 w-20 rounded bg-secondary/60" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-48 rounded bg-secondary" />
        <div className="h-3 w-24 rounded bg-secondary/60" />
      </div>
      <div className="h-px w-full bg-border" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-5/6 rounded bg-secondary" />
        <div className="h-4 w-3/4 rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-2/3 rounded bg-secondary" />
      </div>
    </div>
  )
}
