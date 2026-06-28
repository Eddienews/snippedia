import { useInfiniteQuery } from "@tanstack/react-query";
import { getRandomArticlesPage } from "@/services/wikipediaService";

export function useArticlesInfinite(category?: string, pageSize = 10) {
  return useInfiniteQuery({
    queryKey: ["articles", category ?? "All", pageSize],
    queryFn: async ({ pageParam }) => {
      return getRandomArticlesPage({
        count: pageSize,
        category,
        cursor: pageParam, // {mode, token}
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor, // se existir, carrega mais
    staleTime: 60_000,
  });
}
