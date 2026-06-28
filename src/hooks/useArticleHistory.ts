// /home/snippedia/snip-pedia/src/hooks/useArticleHistory.ts
import { useState, useEffect, useCallback } from "react";
import { WikipediaArticle } from "../services/wikipediaService";

export interface ArticleHistoryItem {
  article: WikipediaArticle;
  viewedAt: string;
  timeSpent?: number;
  startTime?: number;
}

const STORAGE_KEY = "snippedia-history";
const HISTORY_EVENT = "snippedia-history-updated";
const MAX_HISTORY_ITEMS = 1000;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const useArticleHistory = () => {
  const [history, setHistory] = useState<ArticleHistoryItem[]>([]);
  const [currentStartTime, setCurrentStartTime] = useState<number | null>(null);

  const load = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setHistory(safeParse<ArticleHistoryItem[]>(saved, []));
  }, []);

  const persist = useCallback((items: ArticleHistoryItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT));
  }, []);

  useEffect(() => {
    load();

    const onUpdated = () => load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) load();
    };

    window.addEventListener(HISTORY_EVENT, onUpdated as EventListener);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(HISTORY_EVENT, onUpdated as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  const startReadingSession = useCallback((_article: WikipediaArticle) => {
    setCurrentStartTime(Date.now());
  }, []);

  const addToHistory = useCallback((article: WikipediaArticle, timeSpent?: number) => {
    const articleKey = String(article.id || article.title || "").trim().toLowerCase();
    const newItem: ArticleHistoryItem = {
      article,
      viewedAt: new Date().toISOString(),
      timeSpent,
    };

    setHistory((prev) => {
      // Remove duplicates and keep newest entries first.
      const filtered = prev.filter((item) => {
        const itemKey = String(item.article.id || item.article.title || "").trim().toLowerCase();
        if (!articleKey || !itemKey) return true;
        return itemKey !== articleKey;
      });
      const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      persist(newHistory);

      // Dispatch event for analytics tracking instead of direct call
      if (timeSpent && timeSpent > 5000) {
        window.dispatchEvent(
          new CustomEvent("reading-session-completed", {
            detail: {
              article,
              timeSpent,
              scrollDepth: 100, // Assume 100% scroll depth for history items
            },
          })
        );
      }

      return newHistory;
    });
  }, [persist]);

  const endReadingSession = useCallback((article: WikipediaArticle) => {
    const timeSpent = currentStartTime ? Date.now() - currentStartTime : undefined;
    addToHistory(article, timeSpent);
    setCurrentStartTime(null);
  }, [addToHistory, currentStartTime]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT));
  }, []);

  const getRecentArticles = useCallback((count: number = 10) => {
    return history.slice(0, count);
  }, [history]);

  const getTotalReadingTime = useCallback(() => {
    return history.reduce((total, item) => total + (item.timeSpent || 0), 0);
  }, [history]);

  const getReadingStats = useCallback(() => {
    const totalArticles = history.length;
    const totalTime = getTotalReadingTime();
    const averageTime = totalArticles > 0 ? totalTime / totalArticles : 0;

    return {
      totalArticles,
      totalTime,
      averageTime,
    };
  }, [getTotalReadingTime, history.length]);

  return {
    history,
    addToHistory,
    clearHistory,
    getRecentArticles,
    getTotalReadingTime,
    getReadingStats,
    startReadingSession,
    endReadingSession,
  };
};
