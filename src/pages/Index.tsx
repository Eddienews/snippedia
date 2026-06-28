// /home/snippedia/snip-pedia/src/pages/Index.tsx

import { useQuery } from "@tanstack/react-query";
import ArticleViewer from "@/components/ArticleViewer";
import RightSidebar from "@/components/RightSidebar";
import LeftSidebar from "@/components/LeftSidebar";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { getRandomArticles, searchArticles, getArticleById } from "@/services/wikipediaService";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { WikipediaArticle } from "@/services/wikipediaService";
import { readOfflineArticles, saveOfflineArticles } from "@/services/offlineArticleCache";
import { getRandomPlaceholder } from "@/services/placeholders";

const LAST_ARTICLE_KEY = "snippedia-last-article";

type LastArticleRef = {
  id: string;
  title: string;
  savedAt: string;
};

type CurrentArticle = Partial<WikipediaArticle> & {
  id?: string | number;
  title?: string;
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function readLastArticleRef(): LastArticleRef | null {
  const parsed = safeParse<Partial<LastArticleRef> | null>(localStorage.getItem(LAST_ARTICLE_KEY), null);
  if (!parsed || typeof parsed !== "object") return null;
  if (typeof parsed.id !== "string" || !parsed.id.trim()) return null;
  return {
    id: parsed.id.trim(),
    title: typeof parsed.title === "string" ? parsed.title : "",
    savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : new Date().toISOString(),
  };
}

const Index = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const searchQuery = searchParams.get("q");

  // ✅ deep-link support: /a/:id OR ?id=123
  const sharedId = routeId ? Number(routeId) : searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const [currentArticle, setCurrentArticle] = useState<CurrentArticle | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [usingOfflineCache, setUsingOfflineCache] = useState(false);

  // force refresh on mobile + when tab becomes visible again (only when not searching / not deep-link)
  useEffect(() => {
    const shouldRefresh = () => !searchQuery && !sharedId;

    const bump = () => setRefreshTrigger((p) => p + 1);

    const handleVisibilityChange = () => {
      if (!document.hidden && shouldRefresh()) bump();
    };

    const handleFocus = () => {
      if (shouldRefresh()) bump();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      // when bfcache restores the page
      if (e.persisted && shouldRefresh()) bump();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pageshow", handlePageShow);

    // first load on mobile: refresh once (helps with some mobile caching quirks)
    if (window.innerWidth <= 768 && shouldRefresh()) bump();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [searchQuery, sharedId]);

  const queryKey = useMemo(
    () => ["articles", searchQuery, sharedId, refreshTrigger],
    [searchQuery, sharedId, refreshTrigger]
  );

  const offlineCacheKey = useMemo(
    () => `home:${searchQuery ?? ""}:${sharedId ?? ""}`,
    [searchQuery, sharedId]
  );

  const {
    data: articles,
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      setUsingOfflineCache(false);
      try {
        let fetched: WikipediaArticle[] = [];

        // ✅ 1) If this is a shared deep-link, load that exact article first
        if (sharedId && Number.isFinite(sharedId)) {
          try {
            const shared = await getArticleById(sharedId);
            if (shared?.image) fetched.push(shared);
          } catch (e) {
            console.error("Failed to load shared article by id:", e);
          }
        }

        // ✅ 1.5) Continue Reading: no search / no shared link -> preload last viewed article
        if (!searchQuery && !sharedId) {
          const lastRef = readLastArticleRef();
          if (lastRef?.id) {
            try {
              const lastViewed = await getArticleById(lastRef.id);
              if (lastViewed?.image) fetched.push(lastViewed);
            } catch (e) {
              console.error("Failed to load last viewed article:", e);
            }
          }
        }

        // ✅ 2) Then load the rest of the feed
        if (searchQuery) {
          const results = (location.state?.reorderedResults ?? (await searchArticles(searchQuery))) as WikipediaArticle[];
          if (Array.isArray(results)) fetched = fetched.concat(results);
        } else {
          const randoms = await getRandomArticles(6);
          if (Array.isArray(randoms)) fetched = fetched.concat(randoms);
        }

        // ✅ 3) Ensure every item has an image to avoid empty-feed false negatives.
        const withImageFallback = fetched.map((a) =>
          a?.image ? a : { ...a, image: getRandomPlaceholder() }
        );

        // ✅ 4) De-dupe by id (so shared article doesn't appear twice)
        const uniq = Array.from(new Map(withImageFallback.map((a) => [a.id, a])).values());
        saveOfflineArticles(offlineCacheKey, uniq);
        setUsingOfflineCache(false);
        return uniq;
      } catch (e) {
        const cached = readOfflineArticles(offlineCacheKey);
        if (cached.length > 0) {
          setUsingOfflineCache(true);
          return cached;
        }
        throw e;
      }
    },
    retry: 1,

    // smoother UX: avoid refetching constantly and keep cache around briefly
    staleTime: 60_000, // 1 min
    gcTime: 10 * 60_000, // 10 min

    // you already manually refresh on focus/visibility; disabling avoids double work
    refetchOnWindowFocus: false,
  });

  // Prevent toast loops: show error toast only once per "error event"
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleTagClick = (tag: string) => {
    navigate(`/?q=${encodeURIComponent(tag)}`);
  };

  const handleArticleChange = (article: CurrentArticle) => {
    setCurrentArticle(article);
    if (!article?.id) return;

    const payload: LastArticleRef = {
      id: String(article.id),
      title: String(article.title ?? ""),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(LAST_ARTICLE_KEY, JSON.stringify(payload));
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen relative overflow-hidden bg-snippedia-dark">
        <div className="flex h-full">
          <div className="fixed left-2 md:left-4 bottom-32 md:bottom-20 z-30">
            <LoadingSkeleton variant="sidebar" />
          </div>

          <div className="flex-1 relative">
            <div className="h-screen w-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <LoadingSkeleton variant="article" />
              </div>
            </div>
          </div>

          <div className="fixed right-2 md:right-4 bottom-32 md:bottom-20 z-30">
            <div className="flex flex-col space-y-4">
              <LoadingSkeleton variant="avatar" count={4} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // safer + nicer empty/error state (no repeated toast here)
  if (error || !articles || articles.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="text-center px-6">
          <div className="text-white text-lg font-semibold mb-2">Couldn’t load articles</div>
          <div className="text-white/60 text-sm">Try again in a moment, or change your search.</div>

          <button
            onClick={() => setRefreshTrigger((p) => p + 1)}
            className="mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Prefer the shared article first if present
  const firstArticle = currentArticle || articles[0];

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      {usingOfflineCache && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-amber-500/95 text-black text-center py-2 text-xs font-semibold">
          You’re viewing offline content
        </div>
      )}
      <div className="flex h-full">
        <LeftSidebar article={firstArticle} onTagClick={handleTagClick} />
        <ArticleViewer articles={articles} onArticleChange={handleArticleChange} />
        <RightSidebar article={firstArticle} />
      </div>
    </div>
  );
};

export default Index;
