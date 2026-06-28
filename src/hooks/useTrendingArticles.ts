
import { useState, useEffect } from 'react';
import { WikipediaArticle } from '@/services/wikipediaService';
import { useAnalytics } from './useAnalytics';
import type { ArticleHistoryItem } from './useArticleHistory';

export interface TrendingArticle {
  article: WikipediaArticle;
  trendingScore: number;
  views: number;
  engagement: number;
  shareCount: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  recentViews: number;
  category: string;
}

export interface TrendingCategory {
  category: string;
  trendingScore: number;
  articleCount: number;
  totalViews: number;
  trend: 'up' | 'down' | 'stable';
}

const HISTORY_KEY = 'snippedia-history';
const LEGACY_HISTORY_KEY = 'articleHistory';

type HistoryLike = {
  article: WikipediaArticle;
  viewedAt: string;
  category?: string;
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getHistoryForTrending(): HistoryLike[] {
  const current = safeParse<ArticleHistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
  if (Array.isArray(current) && current.length > 0) {
    return current.map((item) => ({
      article: item.article,
      viewedAt: item.viewedAt,
      category: item.article.category,
    }));
  }

  const legacy = safeParse<Array<Record<string, unknown>>>(localStorage.getItem(LEGACY_HISTORY_KEY), []);
  return legacy
    .map((item) => {
      const nested = item.article as WikipediaArticle | undefined;
      const article = nested ?? {
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        image: (item.image as string | null | undefined) ?? null,
        category: typeof item.category === 'string' ? item.category : undefined,
      };

      if (!article.id || !article.title) return null;

      return {
        article,
        viewedAt: typeof item.viewedAt === 'string' ? item.viewedAt : new Date().toISOString(),
        category: typeof item.category === 'string' ? item.category : article.category,
      } satisfies HistoryLike;
    })
    .filter((v): v is HistoryLike => v !== null);
}

type AggregatedArticleStats = {
  article: WikipediaArticle;
  totalViews: number;
  recentViews: number;
  engagement: number;
  shareCount: number;
  category: string;
  dates: Date[];
};

export const useTrendingArticles = () => {
  const { analytics } = useAnalytics();
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [trendingCategories, setTrendingCategories] = useState<TrendingCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate trending score based on multiple factors
  const calculateTrendingScore = (
    views: number,
    recentViews: number,
    engagement: number,
    shareCount: number,
    timeDecay: number
  ): number => {
    const viewsWeight = 0.3;
    const recentViewsWeight = 0.4;
    const engagementWeight = 0.2;
    const shareWeight = 0.1;

    const normalizedViews = Math.log(views + 1) / Math.log(1000);
    const normalizedRecentViews = Math.log(recentViews + 1) / Math.log(100);
    const normalizedEngagement = engagement / 100;
    const normalizedShares = Math.log(shareCount + 1) / Math.log(50);

    const score = (
      normalizedViews * viewsWeight +
      normalizedRecentViews * recentViewsWeight +
      normalizedEngagement * engagementWeight +
      normalizedShares * shareWeight
    ) * timeDecay;

    return Math.round(score * 100);
  };

  // Calculate trend direction and percentage
  const calculateTrend = (currentViews: number, previousViews: number): { trend: 'up' | 'down' | 'stable', percentage: number } => {
    if (previousViews === 0) return { trend: 'stable', percentage: 0 };
    
    const change = ((currentViews - previousViews) / previousViews) * 100;
    
    if (change > 5) return { trend: 'up', percentage: change };
    if (change < -5) return { trend: 'down', percentage: Math.abs(change) };
    return { trend: 'stable', percentage: Math.abs(change) };
  };

  useEffect(() => {
    const updateTrendingData = () => {
      setIsLoading(true);
      
      try {
        // Get article history and engagement data
        const articleHistory = getHistoryForTrending();
        const engagementData = JSON.parse(localStorage.getItem('snippedia-engagement') || '{}');
        void analytics.readingSessions;

        // Calculate trending articles
        const articleStats: Record<string, AggregatedArticleStats> = {};
        
        // Process article history
        articleHistory.forEach((item) => {
          const articleId = item.article?.id;
          if (!articleId) return;

          if (!articleStats[articleId]) {
            articleStats[articleId] = {
              article: item.article,
              totalViews: 0,
              recentViews: 0,
              engagement: 0,
              shareCount: 0,
              category: item.category || item.article.category || 'Uncategorized',
              dates: []
            };
          }

          articleStats[articleId].totalViews++;
          articleStats[articleId].dates.push(new Date(item.viewedAt));

          // Count recent views (last 24 hours)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          if (new Date(item.viewedAt) > oneDayAgo) {
            articleStats[articleId].recentViews++;
          }
        });

        // Add engagement data
        Object.keys(engagementData).forEach(articleId => {
          if (articleStats[articleId]) {
            const engagement = engagementData[articleId];
            articleStats[articleId].engagement = (
              (engagement.scroll || 0) * 10 +
              (engagement.share || 0) * 25 +
              (engagement.favorite || 0) * 15 +
              (engagement.comment || 0) * 20
            );
            articleStats[articleId].shareCount = engagement.share || 0;
          }
        });

        // Calculate trending scores and create trending articles
        const now = Date.now();
        const trending = Object.values(articleStats)
          .filter((stats) => stats.article && stats.totalViews > 0)
          .map((stats) => {
            // Calculate time decay (more recent = higher score)
            const latestView = Math.max(...stats.dates.map((d: Date) => d.getTime()));
            const hoursSinceLastView = (now - latestView) / (1000 * 60 * 60);
            const timeDecay = Math.max(0.1, 1 - (hoursSinceLastView / 168)); // Decay over 1 week

            const trendingScore = calculateTrendingScore(
              stats.totalViews,
              stats.recentViews,
              stats.engagement,
              stats.shareCount,
              timeDecay
            );

            // Calculate trend (comparing last 24h vs previous 24h)
            const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            const previousDayViews = stats.dates.filter((d: Date) => d > twoDaysAgo && d < oneDayAgo).length;
            const trendData = calculateTrend(stats.recentViews, previousDayViews);

            return {
              article: stats.article,
              trendingScore,
              views: stats.totalViews,
              engagement: stats.engagement,
              shareCount: stats.shareCount,
              trend: trendData.trend,
              trendPercentage: trendData.percentage,
              recentViews: stats.recentViews,
              category: stats.category
            } as TrendingArticle;
          })
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 20); // Top 20 trending articles

        setTrendingArticles(trending);

        // Calculate trending categories
        const categoryStats: Record<string, {
          category: string;
          trendingScore: number;
          articleCount: number;
          totalViews: number;
          upTrend: number;
          downTrend: number;
        }> = {};
        
        trending.forEach(article => {
          const category = article.category;
          if (!categoryStats[category]) {
            categoryStats[category] = {
              category,
              trendingScore: 0,
              articleCount: 0,
              totalViews: 0,
              upTrend: 0,
              downTrend: 0
            };
          }

          categoryStats[category].trendingScore += article.trendingScore;
          categoryStats[category].articleCount++;
          categoryStats[category].totalViews += article.views;
          
          if (article.trend === 'up') categoryStats[category].upTrend++;
          if (article.trend === 'down') categoryStats[category].downTrend++;
        });

        const trendingCats = Object.values(categoryStats)
          .map((stats) => ({
            category: stats.category,
            trendingScore: Math.round(stats.trendingScore / stats.articleCount),
            articleCount: stats.articleCount,
            totalViews: stats.totalViews,
            trend: stats.upTrend > stats.downTrend ? 'up' : stats.downTrend > stats.upTrend ? 'down' : 'stable'
          } as TrendingCategory))
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 10);

        setTrendingCategories(trendingCats);

      } catch (error) {
        console.error('Error calculating trending data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateTrendingData();

    // Update trending data every 5 minutes
    const interval = setInterval(updateTrendingData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [analytics.readingSessions]);

  const getTrendingByCategory = (category: string, limit: number = 5): TrendingArticle[] => {
    return trendingArticles
      .filter(article => article.category === category)
      .slice(0, limit);
  };

  const getTopTrendingToday = (limit: number = 10): TrendingArticle[] => {
    return trendingArticles
      .filter(article => article.recentViews > 0)
      .slice(0, limit);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return {
    trendingArticles,
    trendingCategories,
    isLoading,
    getTrendingByCategory,
    getTopTrendingToday,
    getTrendIcon,
    getTrendColor
  };
};
