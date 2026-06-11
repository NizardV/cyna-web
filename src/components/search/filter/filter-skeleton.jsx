import { Skeleton } from "@/components/ui/skeleton"

export function FilterSidebarSkeleton() {
  return (
    <aside className="hidden w-56 shrink-0 space-y-3 md:block">
      <Skeleton className="mb-4 h-4 w-40" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </aside>
  )
}