import { useCallback, useEffect, useMemo, useState } from "react";
import { getRandomArticles, getRandomArticlesByCategory, type WikipediaArticle } from "@/services/wikipediaService";
import { useFavorites } from "@/hooks/useFavorites";
import { useArticleHistory } from "@/hooks/useArticleHistory";

const DIGEST_KEY = "snippedia-daily-digest-v1";
const DIGEST_SIZE = 5;

type DailyDigestCache = {
  date: string;
  articles: WikipediaArticle[];
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function rankInterestCategories(
  favorites: Array<{ article: { category?: string } }>,
  history: Array<{ article: { category?: string } }>
) {
  const counts = new Map<string, number>();

  for (const fav of favorites) {
    const category = fav.article.category?.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 3);
  }

  for (const item of history) {
    const category = item.article.category?.trim();
    if (!category) continue;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)
    .slice(0, 4);
}

function dedupeArticles(items: WikipediaArticle[]) {
  const seen = new Set<string>();
  const out: WikipediaArticle[] = [];
  for (const item of items) {
    const id = String(item.id ?? "").trim();
    if (!id || seen.has(id) || !item.image) continue;
    seen.add(id);
    out.push(item);
  }
  return out;
}

export const useDailyDigest = () => {
  const { favorites } = useFavorites();
  const { history } = useArticleHistory();
  const [digest, setDigest] = useState<WikipediaArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const interestCategories = useMemo(
    () => rankInterestCategories(favorites, history),
    [favorites, history]
  );

  const buildDigest = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = todayKey();
      const cached = safeParse<DailyDigestCache | null>(localStorage.getItem(DIGEST_KEY), null);
      if (cached?.date === today && Array.isArray(cached.articles) && cached.articles.length > 0) {
        setDigest(cached.articles.slice(0, DIGEST_SIZE));
        return;
      }

      const picked: WikipediaArticle[] = [];
      const categoriesToUse =
        interestCategories.length > 0
          ? interestCategories
          : ["History", "Science", "Technology", "Nature"];

      for (const category of categoriesToUse) {
        if (picked.length >= DIGEST_SIZE) break;
        const batch = await getRandomArticlesByCategory(category, 2);
        picked.push(...batch.map((a) => ({ ...a, category: a.category || category })));
      }

      if (picked.length < DIGEST_SIZE) {
        const remaining = DIGEST_SIZE - picked.length;
        picked.push(...(await getRandomArticles(remaining)));
      }

      const finalDigest = dedupeArticles(picked).slice(0, DIGEST_SIZE);

      localStorage.setItem(
        DIGEST_KEY,
        JSON.stringify({
          date: today,
          articles: finalDigest,
        } satisfies DailyDigestCache)
      );

      setDigest(finalDigest);
    } finally {
      setIsLoading(false);
    }
  }, [interestCategories]);

  const refreshDigest = async () => {
    localStorage.removeItem(DIGEST_KEY);
    await buildDigest();
  };

  const interestKey = useMemo(() => interestCategories.join("|"), [interestCategories]);

  useEffect(() => {
    void buildDigest();
  }, [buildDigest, interestKey]);

  return {
    digest,
    isLoading,
    refreshDigest,
    digestDate: todayKey(),
  };
};
