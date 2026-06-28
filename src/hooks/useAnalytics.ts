import { useState, useEffect } from 'react';
import { WikipediaArticle } from '@/services/wikipediaService';
import { cache } from '@/services/cacheService';

export interface ReadingSession {
  articleId: string | number;
  startTime: number;
  endTime?: number;
  timeSpent: number;
  category: string;
  scrollDepth: number;
  interactions: number;
  date: string;
}

export interface CategoryEngagement {
  category: string;
  totalTime: number;
  articleCount: number;
  averageTime: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendingArticle {
  article: WikipediaArticle;
  views: number;
  engagement: number;
  shareCount: number;
  trend: number;
}

export interface EngagementHeatmap {
  hour: number;
  day: number;
  engagement: number;
  articlesRead: number;
}

export interface AnalyticsData {
  readingSessions: ReadingSession[];
  categoryEngagement: CategoryEngagement[];
  trendingArticles: TrendingArticle[];
  engagementHeatmap: EngagementHeatmap[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    streakDates: string[];
    weeklyGoal: number;
    weeklyProgress: number;
  };
  readingStats: {
    totalTimeToday: number;
    totalTimeWeek: number;
    totalTimeMonth: number;
    averageSessionTime: number;
    articlesPerDay: number;
    peakReadingHour: number;
  };
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    readingSessions: [],
    categoryEngagement: [],
    trendingArticles: [],
    engagementHeatmap: [],
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      streakDates: [],
      weeklyGoal: 7,
      weeklyProgress: 0
    },
    readingStats: {
      totalTimeToday: 0,
      totalTimeWeek: 0,
      totalTimeMonth: 0,
      averageSessionTime: 0,
      articlesPerDay: 0,
      peakReadingHour: 12
    }
  });

  // Memoized calculation functions with intelligent caching
  const calculateCategoryEngagement = cache.memoize(
    (sessions: ReadingSession[]) => {
      const categoryStats: { [key: string]: { time: number; count: number; engagement: number } } = {};
      sessions.forEach((session: ReadingSession) => {
        if (!categoryStats[session.category]) {
          categoryStats[session.category] = { time: 0, count: 0, engagement: 0 };
        }
        categoryStats[session.category].time += session.timeSpent;
        categoryStats[session.category].count++;
        categoryStats[session.category].engagement += session.scrollDepth * session.interactions;
      });

      return Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        totalTime: stats.time,
        articleCount: stats.count,
        averageTime: stats.time / stats.count || 0,
        engagement: stats.engagement / stats.count || 0,
        trend: 'stable' as const
      })).sort((a, b) => b.totalTime - a.totalTime);
    },
    (sessions) => `category-engagement-${sessions.length}-${sessions.reduce((acc, s) => acc + s.timeSpent, 0)}`,
    10 * 60 * 1000 // Cache for 10 minutes
  );

  const calculateEngagementHeatmap = cache.memoize(
    (sessions: ReadingSession[]) => {
      const heatmapData: { [key: string]: { engagement: number; articles: number } } = {};
      sessions.forEach((session: ReadingSession) => {
        const date = new Date(session.startTime);
        const key = `${date.getDay()}-${date.getHours()}`;
        if (!heatmapData[key]) {
          heatmapData[key] = { engagement: 0, articles: 0 };
        }
        heatmapData[key].engagement += session.scrollDepth * session.interactions;
        heatmapData[key].articles++;
      });

      const engagementHeatmap: EngagementHeatmap[] = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const key = `${day}-${hour}`;
          const data = heatmapData[key] || { engagement: 0, articles: 0 };
          engagementHeatmap.push({
            day,
            hour,
            engagement: data.engagement,
            articlesRead: data.articles
          });
        }
      }
      return engagementHeatmap;
    },
    (sessions) => `heatmap-${sessions.length}-${Date.now() - (Date.now() % (24 * 60 * 60 * 1000))}`, // Cache per day
    24 * 60 * 60 * 1000 // Cache for 24 hours
  );

  const calculateStreakData = cache.memoize(
    (sessions: ReadingSession[]) => {
      const readingDates = [...new Set(sessions.map((s: ReadingSession) => s.date))].sort() as string[];
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      for (let i = 0; i < readingDates.length; i++) {
        const currentDate = new Date(readingDates[i]);
        const prevDate = i > 0 ? new Date(readingDates[i - 1]) : null;
        
        if (prevDate && (currentDate.getTime() - prevDate.getTime()) === 24 * 60 * 60 * 1000) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
        
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        if (readingDates[i] === today) currentStreak = tempStreak;
      }

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekSessions = sessions.filter((s: ReadingSession) => new Date(s.startTime) > weekAgo);
      
      return {
        currentStreak,
        longestStreak,
        streakDates: readingDates,
        weeklyGoal: 7,
        weeklyProgress: weekSessions.length
      };
    },
    (sessions) => `streak-${sessions.length}-${new Date().toISOString().split('T')[0]}`,
    60 * 60 * 1000 // Cache for 1 hour
  );

  // Track reading session
  const trackReadingSession = (article: WikipediaArticle, timeSpent: number, scrollDepth: number = 100) => {
    const tagsCandidate = (article as { tags?: unknown }).tags;
    const firstTag =
      Array.isArray(tagsCandidate) && typeof tagsCandidate[0] === "string"
        ? tagsCandidate[0]
        : undefined;
    const fallbackCategory =
      typeof (article as { category?: unknown }).category === "string"
        ? ((article as { category?: string }).category || "")
        : "";

    const session: ReadingSession = {
      articleId: article.id,
      startTime: Date.now() - timeSpent,
      endTime: Date.now(),
      timeSpent,
      category: firstTag || fallbackCategory || "Uncategorized",
      scrollDepth,
      interactions: Math.floor(Math.random() * 5) + 1,
      date: new Date().toISOString().split('T')[0]
    };

    const savedSessions = JSON.parse(localStorage.getItem('snippedia-sessions') || '[]');
    savedSessions.push(session);
    localStorage.setItem('snippedia-sessions', JSON.stringify(savedSessions.slice(-1000)));
    
    // Clear related caches when new data is added
    cache.delete('category-engagement-' + savedSessions.length);
    cache.delete('heatmap-' + savedSessions.length);
    cache.delete('streak-' + savedSessions.length);
  };

  // Track article engagement
  const trackEngagement = (articleId: string | number, engagementType: 'scroll' | 'share' | 'favorite' | 'comment') => {
    const engagementData = JSON.parse(localStorage.getItem('snippedia-engagement') || '{}');
    if (!engagementData[articleId]) {
      engagementData[articleId] = { scroll: 0, share: 0, favorite: 0, comment: 0 };
    }
    engagementData[articleId][engagementType]++;
    localStorage.setItem('snippedia-engagement', JSON.stringify(engagementData));
  };

  // Listen for reading session events
  useEffect(() => {
    const handleReadingSession = (event: CustomEvent) => {
      const { article, timeSpent, scrollDepth } = event.detail;
      trackReadingSession(article, timeSpent, scrollDepth);
    };

    window.addEventListener('reading-session-completed', handleReadingSession as EventListener);
    
    return () => {
      window.removeEventListener('reading-session-completed', handleReadingSession as EventListener);
    };
  }, []);

  useEffect(() => {
    const calculateAnalytics = () => {
      const cacheKey = `analytics-${Date.now() - (Date.now() % (5 * 60 * 1000))}`; // 5-minute cache
      const cachedAnalytics = cache.get<AnalyticsData>(cacheKey);
      
      if (cachedAnalytics) {
        setAnalytics(cachedAnalytics);
        return;
      }

      const sessions = JSON.parse(localStorage.getItem('snippedia-sessions') || '[]') as ReadingSession[];
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Use cached calculations
      const categoryEngagement = calculateCategoryEngagement(sessions);
      const engagementHeatmap = calculateEngagementHeatmap(sessions);
      const streakData = calculateStreakData(sessions);

      // Calculate reading stats
      const todaySessions = sessions.filter((s: ReadingSession) => s.date === today);
      const weekSessions = sessions.filter((s: ReadingSession) => new Date(s.startTime) > weekAgo);
      const monthSessions = sessions.filter((s: ReadingSession) => new Date(s.startTime) > monthAgo);

      const totalTimeToday = todaySessions.reduce((acc: number, s: ReadingSession) => acc + s.timeSpent, 0);
      const totalTimeWeek = weekSessions.reduce((acc: number, s: ReadingSession) => acc + s.timeSpent, 0);
      const totalTimeMonth = monthSessions.reduce((acc: number, s: ReadingSession) => acc + s.timeSpent, 0);
      const averageSessionTime = sessions.length > 0 ? sessions.reduce((acc: number, s: ReadingSession) => acc + s.timeSpent, 0) / sessions.length : 0;

      // Calculate peak reading hour
      const hourStats: { [hour: number]: number } = {};
      sessions.forEach((session: ReadingSession) => {
        const hour = new Date(session.startTime).getHours();
        hourStats[hour] = (hourStats[hour] || 0) + 1;
      });
      const peakReadingHourEntry = Object.entries(hourStats).reduce((a, b) => hourStats[parseInt(a[0])] > hourStats[parseInt(b[0])] ? a : b, ['12', 0]);
      const peakReadingHour = parseInt(peakReadingHourEntry[0]);

      const analyticsData: AnalyticsData = {
        readingSessions: sessions,
        categoryEngagement,
        trendingArticles: [],
        engagementHeatmap,
        streakData,
        readingStats: {
          totalTimeToday,
          totalTimeWeek,
          totalTimeMonth,
          averageSessionTime,
          articlesPerDay: monthSessions.length / 30,
          peakReadingHour
        }
      };

      // Cache the calculated analytics
      cache.set(cacheKey, analyticsData, 5 * 60 * 1000); // 5 minutes
      setAnalytics(analyticsData);
    };

    calculateAnalytics();
  }, [calculateCategoryEngagement, calculateEngagementHeatmap, calculateStreakData]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return {
    analytics,
    trackReadingSession,
    trackEngagement,
    formatTime
  };
};
