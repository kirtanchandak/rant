export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-full rounded-xl bg-secondary" />
      <div className="space-y-0">
        {[...Array(5)].map((_, i) => (
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
