// /home/snippedia/snip-pedia/src/hooks/useDiscoverData.ts
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import {
  getTrendingArticles,
  getTrendingArticlesByCategory,
  getRandomArticles,
  getRandomArticlesByCategory,
  searchArticles,
  WikipediaArticle,
} from "@/services/wikipediaService";

type SectionUI = "trending" | "foryou" | "explore";

const DEFAULT_LANG = "en";
const DEFAULT_PAGE_SIZE = 12;

function normCategory(cat: string) {
  const c = (cat || "").trim();
  return c || "All";
}

function normSection(sec: string): SectionUI {
  if (sec === "trending" || sec === "foryou" || sec === "explore") return sec;
  return "trending";
}

async function fetchDiscoverPage(args: {
  category: string;
  section: SectionUI;
  pageParam: number;
  pageSize: number;
  lang: string;
}): Promise<WikipediaArticle[]> {
  const { category, section, pageParam, pageSize, lang } = args;
  const cat = normCategory(category);
  const sec = normSection(section);

  // ✅ TRENDING: sem paginação real → sempre 1 página só
  if (sec === "trending") {
    if (cat === "All") return await getTrendingArticles(pageSize, lang);
    return await getTrendingArticlesByCategory(cat, pageSize, lang);
  }

  // ✅ FOR YOU: paginação "fake" → cada pageParam puxa mais random
  if (sec === "foryou") {
    if (cat === "All") return await getRandomArticles(pageSize, "", lang);
    return await getRandomArticlesByCategory(cat, pageSize, lang);
  }

  // ✅ EXPLORE: sem query aqui (no seu app, explore geralmente usa searchQuery em outro hook)
  // Para não travar a UI, retornamos vazio.
  return await searchArticles(cat, lang); // opcional: usa categoria como termo
}

export function useDiscoverData(category: string, section: SectionUI, lang = DEFAULT_LANG, pageSize = DEFAULT_PAGE_SIZE) {
  const cat = normCategory(category);
  const sec = normSection(section);

  // ✅ QueryKey inclui category + section (isso força reset total ao trocar categoria/aba)
  const queryKey = useMemo(() => ["discover", sec, cat, lang, pageSize], [sec, cat, lang, pageSize]);

  return useInfiniteQuery({
    queryKey,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const data = await fetchDiscoverPage({
        category: cat,
        section: sec,
        pageParam: Number(pageParam ?? 0),
        pageSize,
        lang,
      });
      return data;
    },

    // ✅ Trending não pagina: só 1 page e acabou
    getNextPageParam: (lastPage, allPages) => {
      if (sec === "trending") return undefined; // sem next
      // foryou/explore: permite “infinite”
      return allPages.length; // 0,1,2,3...
    },

    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
