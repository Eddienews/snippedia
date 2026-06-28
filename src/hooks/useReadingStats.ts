
import { useState, useEffect } from 'react';
import { useArticleHistory } from './useArticleHistory';
import type { ArticleHistoryItem } from './useArticleHistory';

export interface ReadingStats {
  totalArticlesRead: number;
  totalTimeSpent: number; // em milissegundos
  averageReadTime: number;
  articlesThisWeek: number;
  articlesThisMonth: number;
  favoriteCategories: { category: string; count: number }[];
  longestSession: number;
  streak: number; // dias consecutivos lendo
}

const HISTORY_KEY = 'snippedia-history';
const LEGACY_HISTORY_KEY = 'articleHistory';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getStoredHistory(): ArticleHistoryItem[] {
  const rawNew = safeParse<unknown[]>(localStorage.getItem(HISTORY_KEY), []);
  if (rawNew.length > 0) return rawNew as ArticleHistoryItem[];

  const rawLegacy = safeParse<unknown[]>(localStorage.getItem(LEGACY_HISTORY_KEY), []);
  return rawLegacy
    .map((item) => {
      const obj = item as { article?: unknown; viewedAt?: unknown; timeSpent?: unknown; id?: unknown; title?: unknown; image?: unknown; category?: unknown };
      if (typeof obj !== 'object' || obj === null) return null;

      // Legacy format saved flattened article fields.
      const legacyArticle = obj.article && typeof obj.article === 'object'
        ? obj.article as ArticleHistoryItem['article']
        : {
            id: String(obj.id ?? ''),
            title: String(obj.title ?? ''),
            image: (obj.image as string | null | undefined) ?? null,
            category: typeof obj.category === 'string' ? obj.category : undefined,
          };

      if (!legacyArticle?.id || !legacyArticle?.title) return null;

      return {
        article: legacyArticle,
        viewedAt: typeof obj.viewedAt === 'string' ? obj.viewedAt : new Date().toISOString(),
        timeSpent: typeof obj.timeSpent === 'number' ? obj.timeSpent : undefined,
      } as ArticleHistoryItem;
    })
    .filter((v): v is ArticleHistoryItem => v !== null);
}

export const useReadingStats = () => {
  const { history } = useArticleHistory();
  const [stats, setStats] = useState<ReadingStats>({
    totalArticlesRead: 0,
    totalTimeSpent: 0,
    averageReadTime: 0,
    articlesThisWeek: 0,
    articlesThisMonth: 0,
    favoriteCategories: [],
    longestSession: 0,
    streak: 0
  });

  useEffect(() => {
    if (history.length === 0) return;

    const calculateStats = () => {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total articles and time
      const totalArticlesRead = history.length;
      const totalTimeSpent = history.reduce((acc, item) => acc + (item.timeSpent || 0), 0);
      const averageReadTime = totalTimeSpent / totalArticlesRead || 0;

      // Articles this week/month
      const articlesThisWeek = history.filter(item => 
        new Date(item.viewedAt) > oneWeekAgo
      ).length;
      
      const articlesThisMonth = history.filter(item => 
        new Date(item.viewedAt) > oneMonthAgo
      ).length;

      // Favorite categories from unified history storage
      const articleHistory = getStoredHistory();
      const categoryCount: { [key: string]: number } = {};
      
      articleHistory.forEach((item) => {
        const category = item.article.category || 'Uncategorized';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const favoriteCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Longest session
      const longestSession = Math.max(...history.map(item => item.timeSpent || 0));

      // Calculate streak (simplified - consecutive days with reading)
      const sortedDates = history
        .map(item => new Date(item.viewedAt).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      let streak = 0;
      let currentDate = new Date();
      
      for (const dateStr of sortedDates) {
        const date = new Date(dateStr);
        const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
          streak++;
          currentDate = date;
        } else {
          break;
        }
      }

      setStats({
        totalArticlesRead,
        totalTimeSpent,
        averageReadTime,
        articlesThisWeek,
        articlesThisMonth,
        favoriteCategories,
        longestSession,
        streak
      });
    };

    calculateStats();
  }, [history]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return {
    stats,
    formatTime
  };
};
