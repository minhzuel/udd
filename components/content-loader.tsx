export function ContentLoader() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-muted-foreground">Loading more products...</span>
    </div>
  )
} 