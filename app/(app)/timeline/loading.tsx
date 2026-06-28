export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded-lg bg-secondary" />
      <div className="space-y-0">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="py-4 border-b border-border flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-12 rounded bg-secondary/60" />
              <div className="h-4 w-full rounded bg-secondary" />
              <div className="h-4 w-2/3 rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
