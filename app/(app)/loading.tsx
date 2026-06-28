export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-secondary" />
        <div className="h-4 w-32 rounded-md bg-secondary/60" />
      </div>
      <div className="h-px w-full bg-border" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="py-4 border-b border-border space-y-2">
            <div className="h-3 w-16 rounded bg-secondary/60" />
            <div className="h-4 w-full rounded bg-secondary" />
            <div className="h-4 w-3/4 rounded bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  )
}
