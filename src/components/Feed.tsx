import { useEffect, useMemo, useRef } from "react";
import { useArticlesInfinite } from "@/hooks/useArticlesInfinite";
import { clearUsedArticlesCache } from "@/services/wikipediaService";

// ajuste estes imports conforme o seu projeto
import ArticleCard from "@/components/ArticleCard";
import SkeletonList from "@/components/SkeletonList";

export function Feed({ category }: { category?: string }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useArticlesInfinite(category, 10);

  // dedup final por segurança (cross-page)
  const articles = useMemo(() => {
    const seen = new Set<string | number>();
    const out: any[] = [];
    for (const page of data?.pages ?? []) {
      for (const a of page.items) {
        const key = (a as any).id ?? (a as any).wikipedia_id ?? a.title;
        if (key && !seen.has(key)) {
          seen.add(key);
          out.push(a);
        }
      }
    }
    return out;
  }, [data]);

  // limpa o pool quando a categoria muda
  useEffect(() => {
    clearUsedArticlesCache();
  }, [category]);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "600px 0px", threshold: 0.01 }
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      {articles.map((a) => (
        <ArticleCard
          key={(a as any).id ?? (a as any).wikipedia_id ?? a.title}
          article={a}
        />
      ))}
      <div ref={loadMoreRef} />
      {isFetchingNextPage && <SkeletonList count={3} />}
    </>
  );
}
