import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getRandomArticles, type WikipediaArticle } from "@/services/wikipediaService";

type Options = {
  category?: string;
  prefetchAhead?: number; // quantos artigos manter em buffer à frente
  batchSize?: number;     // quantidade por busca
};

function keyOf(a: WikipediaArticle) {
  return (a as any).wikipedia_id ?? (a as any).id ?? a.title;
}

export function useHeroInfiniteArticles(
  initial: WikipediaArticle[],
  { category, prefetchAhead = 3, batchSize = 6 }: Options = {}
) {
  const [items, setItems] = useState<WikipediaArticle[]>(
    () => initial?.filter(a => a?.image) ?? []
  );
  const [index, setIndex] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  // dedup local (além do usedArticles do serviço)
  const seenRef = useRef<Set<string | number>>(new Set(initial.map(keyOf)));
  // “cursor” para variar resultados da API quando necessário
  const offsetRef = useRef(0);

  const current = items[index];

  const fetchMore = useCallback(async (count = batchSize) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      // tenta até conseguir algo novo (2 tentativas com offset diferente)
      for (let tries = 0; tries < 2; tries++) {
        const fresh = await getRandomArticles(count, category, offsetRef.current);
        offsetRef.current += 20; // desloca a janela na próxima busca
        const uniques = fresh
          .filter(a => a?.image)
          .filter(a => !seenRef.current.has(keyOf(a)));

        if (uniques.length) {
          uniques.forEach(a => seenRef.current.add(keyOf(a)));
          setItems(prev => [...prev, ...uniques]);
          break;
        }
      }
    } finally {
      setIsFetching(false);
    }
  }, [category, batchSize, isFetching]);

  // mantém um buffer à frente
  const ensureBuffer = useCallback(() => {
    const remaining = items.length - 1 - index;
    if (remaining < prefetchAhead) {
      fetchMore(batchSize);
    }
  }, [items.length, index, prefetchAhead, batchSize, fetchMore]);

  useEffect(() => { ensureBuffer(); }, [index, ensureBuffer]);

  // APIs de navegação
  const next = useCallback(() => {
    if (index < items.length - 1) setIndex(i => i + 1);
    else ensureBuffer();
  }, [index, items.length, ensureBuffer]);

  const prev = useCallback(() => {
    if (index > 0) setIndex(i => i - 1);
  }, [index]);

  // Exponha um sentinel para IntersectionObserver (opcional)
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) ensureBuffer();
      },
      { root: null, rootMargin: "800px 0px", threshold: 0.01 }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [ensureBuffer]);

  // gestos (wheel e touch) no estilo TikTok
  const startY = useRef<number | null>(null);
  const bindGestures = useMemo(() => {
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10) return;
      if (e.deltaY > 0) next(); else prev();
    };
    const onTouchStart = (e: TouchEvent) => { startY.current = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.changedTouches[0].clientY - startY.current;
      startY.current = null;
      if (Math.abs(dy) < 30) return;
      if (dy < 0) next(); else prev();
    };
    return { onWheel, onTouchStart, onTouchEnd };
  }, [next, prev]);

  return { items, index, current, setIndex, next, prev, isFetching, sentinelRef, bindGestures };
}
