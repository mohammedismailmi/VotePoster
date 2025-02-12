import { useQuery } from "@tanstack/react-query";
import type { Poster } from "@shared/schema";
import { PosterCard } from "./poster-card";
import { Skeleton } from "@/components/ui/skeleton";

export function PosterGrid() {
  const { data: posters, isLoading } = useQuery<Poster[]>({
    queryKey: ['/api/posters'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-8 w-full" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posters?.length) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No posters available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posters.map((poster) => (
        <PosterCard key={poster.id} poster={poster} />
      ))}
    </div>
  );
}
