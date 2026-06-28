
import { useNavigate } from "react-router-dom";
import { WikipediaArticle } from "@/services/wikipediaService";
import type { ArticleHistoryItem } from "./useArticleHistory";

const HISTORY_KEY = "snippedia-history";
const MAX_HISTORY_ITEMS = 1000;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const useArticleNavigation = (selectedCategory: string) => {
  const navigate = useNavigate();

  const handleArticleClick = (article: WikipediaArticle) => {
    const history = safeParse<ArticleHistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
    const articleKey = String(article.id || article.title || "").trim().toLowerCase();
    const historyItem: ArticleHistoryItem = {
      article: {
        ...article,
        category: selectedCategory,
      },
      viewedAt: new Date().toISOString(),
    };
    const updatedHistory = [
      historyItem,
      ...history.filter((item) => {
        const itemKey = String(item.article.id || item.article.title || "").trim().toLowerCase();
        if (!articleKey || !itemKey) return true;
        return itemKey !== articleKey;
      }),
    ].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    window.dispatchEvent(new CustomEvent("snippedia-history-updated"));
    
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: { reorderedResults: [article] }
    });
  };

  return { handleArticleClick };
};
