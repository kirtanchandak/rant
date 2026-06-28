export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-6 w-40 rounded-lg bg-secondary" />
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-secondary" />
        ))}
      </div>
    </div>
  )
}
