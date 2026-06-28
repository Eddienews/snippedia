
import { useEffect, useRef } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useScrollDebounce } from '@/hooks/useDebounce';
import { WikipediaArticle } from '@/services/wikipediaService';

interface AnalyticsTrackerProps {
  article: WikipediaArticle;
  isVisible: boolean;
}

const AnalyticsTracker = ({ article, isVisible }: AnalyticsTrackerProps) => {
  const { trackReadingSession, trackEngagement } = useAnalytics();
  const startTimeRef = useRef<number | null>(null);
  const scrollDepthRef = useRef(0);
  const hasTrackedScroll = useRef(false);
  
  // Use debounced scroll for better performance
  const { scrollY, isScrolling } = useScrollDebounce(150);

  useEffect(() => {
    if (isVisible && article) {
      // Start tracking reading session
      startTimeRef.current = Date.now();
      scrollDepthRef.current = 0;
      hasTrackedScroll.current = false;
      
      return () => {
        // Track reading session when component unmounts or article changes
        if (startTimeRef.current) {
          const timeSpent = Date.now() - startTimeRef.current;
          if (timeSpent > 5000) { // Only track if user spent more than 5 seconds
            trackReadingSession(article, timeSpent, scrollDepthRef.current);
          }
        }
      };
    }
  }, [article, isVisible, trackReadingSession]);

  // Handle debounced scroll tracking
  useEffect(() => {
    if (isVisible && article && !isScrolling) {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollDepth = Math.min(100, Math.round((scrollY + windowHeight) / documentHeight * 100));
      
      if (scrollDepth > scrollDepthRef.current) {
        scrollDepthRef.current = scrollDepth;
      }
      
      // Track scroll engagement when user scrolls past 50%
      if (scrollDepth > 50 && !hasTrackedScroll.current) {
        trackEngagement(article.id, 'scroll');
        hasTrackedScroll.current = true;
      }
    }
  }, [scrollY, isScrolling, article, isVisible, trackEngagement]);

  // Track when user adds to favorites
  useEffect(() => {
    const handleFavorite = (event: CustomEvent) => {
      if (event.detail?.articleId === article.id) {
        trackEngagement(article.id, 'favorite');
      }
    };

    // Listen for favorite events
    window.addEventListener('article-favorited', handleFavorite as EventListener);
    
    return () => {
      window.removeEventListener('article-favorited', handleFavorite as EventListener);
    };
  }, [article.id, trackEngagement]);

  // Track share events
  useEffect(() => {
    const handleShare = (event: CustomEvent) => {
      if (event.detail?.articleId === article.id) {
        trackEngagement(article.id, 'share');
      }
    };

    window.addEventListener('article-shared', handleShare as EventListener);
    
    return () => {
      window.removeEventListener('article-shared', handleShare as EventListener);
    };
  }, [article.id, trackEngagement]);

  return null; // This component doesn't render anything
};

export default AnalyticsTracker;
