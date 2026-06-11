import { Skeleton } from "@/components/ui/skeleton"

export function CategoryHeader({ loading, imageUrl, name, description }) {
  return (
    <div className="relative w-full bg-muted">
      {loading ? (
        <Skeleton className="h-[250px] md:h-[350px] w-full rounded-none" />
      ) : (
        <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden flex items-center justify-center">
          {imageUrl && (
            <>
              <img src={imageUrl} alt={name} className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-black/60" />
            </>
          )}
          
          <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {name}
            </h1>
            {description && (
              <p className="mt-4 text-sm md:text-base text-white/90 drop-shadow">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}