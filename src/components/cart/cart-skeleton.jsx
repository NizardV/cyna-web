import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Squelette de chargement de la page panier (2 lignes d'articles + résumé).
 */
export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <Card className="flex-1">
        <CardContent className="p-0">
          {[1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-start gap-6 border-b border-border px-4 py-4 last:border-0">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="w-full md:w-72">
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
    </div>
  );
}
