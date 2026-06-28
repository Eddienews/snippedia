import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "./ui/progress";
import { getRandomArticles } from "../services/wikipediaService";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import { useArticleHistory } from "../hooks/useArticleHistory";
import { useReadingSettings } from "../hooks/useReadingSettings";
import { useThemeSettings } from "../hooks/useThemeSettings";
import ThemeSettings from "./ThemeSettings";
import SocialInteractions from "./SocialInteractions";
import AnalyticsTracker from "./AnalyticsTracker";
import type { WikipediaArticle } from "../services/wikipediaService";

type ViewerArticle = Partial<WikipediaArticle> & {
  wikipedia_id?: string | number;
  summary?: string;
  fullurl?: string;
  tags?: string[];
  readTime?: number;
  shareUrl?: string;
};

type ArticleViewerProps = {
  articles: ViewerArticle[];
  onArticleChange?: (article: ViewerArticle) => void;
};

const BATCH_SIZE = 6;
const PREFETCH_AHEAD = 2;
const TEXT_SPEED_KEY = "snippedia-text-speed";
const TEXT_SPEED_STEPS = [1, 1.5, 2] as const;

const ArticleViewer = ({ articles: initialArticles, onArticleChange }: ArticleViewerProps) => {
  const safeInitial = useMemo<ViewerArticle[]>(
    () => (Array.isArray(initialArticles) ? initialArticles : []),
    [initialArticles]
  );

  const [articles, setArticles] = useState<ViewerArticle[]>(safeInitial);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [textSpeed, setTextSpeed] = useState<number>(() => {
    const raw = localStorage.getItem(TEXT_SPEED_KEY);
    const parsed = Number(raw);
    return TEXT_SPEED_STEPS.includes(parsed as (typeof TEXT_SPEED_STEPS)[number]) ? parsed : 1;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const viewStartTimeRef = useRef<number>(Date.now());
  const hasSavedCurrentViewRef = useRef<boolean>(false);
  const currentIndexRef = useRef(0);
  const articlesRef = useRef<ViewerArticle[]>([]);

  // ✅ Proteção contra desestruturação de hooks que podem falhar
  const historyHook = useArticleHistory();
  const addToHistory = historyHook?.addToHistory;
  
  const readingSettingsHook = useReadingSettings();
  const settings = readingSettingsHook?.settings;
  
  const themeSettings = useThemeSettings();
  const getFontSizeClass = useCallback(() => {
    return typeof themeSettings?.getFontSizeClass === 'function' 
      ? themeSettings.getFontSizeClass() 
      : "";
  }, [themeSettings]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const apply = (matches: boolean) => {
      setIsTouchDevice(matches);
      if (matches) setShowControls(false);
    };

    apply(media.matches);
    const listener = (event: MediaQueryListEvent) => apply(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const showControlsOnTouch = useCallback(() => {
    if (!isTouchDevice) return;
    setShowControls(true);
    if (controlsHideTimeoutRef.current) clearTimeout(controlsHideTimeoutRef.current);
    controlsHideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3200);
  }, [isTouchDevice]);

  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { articlesRef.current = articles; }, [articles]);
  useEffect(() => { localStorage.setItem(TEXT_SPEED_KEY, String(textSpeed)); }, [textSpeed]);

  const list = useMemo(() => (Array.isArray(articles) ? articles : []), [articles]);
  const currentArticle = list[currentIndex] || null;

  const getArticleText = (a: ViewerArticle) => String(a?.content ?? a?.extract ?? a?.summary ?? a?.description ?? "");

  const normalizeForHistory = (a: ViewerArticle): WikipediaArticle => ({
    id: String(a?.wikipedia_id ?? a?.id ?? a?.title ?? ""),
    title: String(a?.title ?? ""),
    image: a?.image, 
    url: a?.url || a?.fullurl,
    category: a?.category,
    content: a?.content,
    extract: a?.extract,
    description: a?.description,
    views: a?.views,
  });

  const flushCurrentArticleToHistory = useCallback(() => {
    if (typeof addToHistory !== "function") return;
    if (hasSavedCurrentViewRef.current) return;

    const current = articlesRef.current[currentIndexRef.current];
    if (!current) return;

    const timeSpent = Date.now() - viewStartTimeRef.current;
    if (timeSpent <= 3000) return;

    addToHistory(normalizeForHistory(current), timeSpent);
    hasSavedCurrentViewRef.current = true;
  }, [addToHistory]);

  const loadMoreArticles = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const newArticles = await getRandomArticles(BATCH_SIZE);
      if (newArticles?.length > 0) {
        setArticles(prev => [...prev, ...newArticles]);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const goToNextArticle = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < articlesRef.current.length) {
      const el = document.querySelector('[data-index="' + nextIdx + '"]');
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      loadMoreArticles();
    }
  }, [loadMoreArticles]);

  const cycleTextSpeed = useCallback(() => {
    setTextSpeed((prev) => {
      const idx = TEXT_SPEED_STEPS.findIndex((v) => v === prev);
      return TEXT_SPEED_STEPS[(idx + 1) % TEXT_SPEED_STEPS.length];
    });
  }, []);

  const startTextAnimation = useCallback(() => {
    if (!isVisible || !isPlaying || !currentArticle) return;
    const text = getArticleText(currentArticle);
    if (!text) { setDisplayedText(""); setProgress(100); return; }

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);

    let charIdx = 0;
    const readingSettings = settings as { readingSpeedWpm?: number } | undefined;
    const wpm = typeof readingSettings?.readingSpeedWpm === "number" ? readingSettings.readingSpeedWpm : 200;
    const effectiveWpm = Math.max(50, wpm * textSpeed);
    const targetMs = Math.max(9000, Math.min(60000, (text.split(/\s+/).length / effectiveWpm) * 60000));
    const delay = Math.max(12, Math.min(60, Math.round(targetMs / Math.max(1, text.length))));

    intervalRef.current = setInterval(() => {
      if (!isPlaying) return;
      if (charIdx <= text.length) {
        setDisplayedText(text.slice(0, charIdx));
        setProgress((charIdx / text.length) * 100);
        charIdx++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (autoAdvance) {
          autoAdvanceTimeoutRef.current = setTimeout(goToNextArticle, 2500);
        }
      }
    }, delay);
  }, [isVisible, isPlaying, currentArticle, autoAdvance, goToNextArticle, settings, textSpeed]);

  useEffect(() => {
    if (currentArticle) {
      setIsVisible(true);
      setDisplayedText("");
      setProgress(0);
      onArticleChange?.(currentArticle);
      viewStartTimeRef.current = Date.now();
      hasSavedCurrentViewRef.current = false;
      
      // ✅ Sintaxe de string robusta para evitar erro de build
      document.title = String(currentArticle.title || "Article") + " | Snippedia";

      if (currentIndex >= list.length - PREFETCH_AHEAD) loadMoreArticles();
    }
  }, [currentIndex, currentArticle, onArticleChange, list.length, loadMoreArticles]);

  useEffect(() => {
    startTextAnimation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, [startTextAnimation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            const prevIdx = currentIndexRef.current;
            if (idx !== prevIdx && articlesRef.current[prevIdx] && typeof addToHistory === 'function') {
              const timeSpent = Date.now() - viewStartTimeRef.current;
              // ✅ Salva apenas se o usuário leu por mais de 3 segundos
              if (timeSpent > 3000) {
                addToHistory(normalizeForHistory(articlesRef.current[prevIdx]), timeSpent);
                hasSavedCurrentViewRef.current = true;
              }
            }
            setCurrentIndex(idx);
            setIsVisible(true);
            viewStartTimeRef.current = Date.now();
            hasSavedCurrentViewRef.current = false;
          }
        });
      },
      { threshold: 0.6 }
    );
    container.querySelectorAll(".article-section").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [list.length, addToHistory]);

  useEffect(() => {
    const handlePageHide = () => flushCurrentArticleToHistory();
    const handleBeforeUnload = () => flushCurrentArticleToHistory();
    const handleVisibilityChange = () => {
      if (document.hidden) flushCurrentArticleToHistory();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushCurrentArticleToHistory]);

  useEffect(() => {
    return () => {
      if (controlsHideTimeoutRef.current) clearTimeout(controlsHideTimeoutRef.current);
      flushCurrentArticleToHistory();
    };
  }, [flushCurrentArticleToHistory]);

  return (
    <main 
      ref={containerRef} 
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory relative bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={showControlsOnTouch}
    >
      {currentArticle && <AnalyticsTracker article={currentArticle} isVisible={isVisible} />}

      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 md:w-auto max-w-xl flex items-center justify-center gap-3 md:gap-6 bg-black/60 backdrop-blur-lg p-3 md:p-4 rounded-full border border-white/10 flex-wrap"
            onTouchStart={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="text-white/70 hover:text-white"><SkipBack /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="bg-white text-black p-3 rounded-full">{isPlaying ? <Pause /> : <Play />}</button>
            <button onClick={goToNextArticle} className="text-white/70 hover:text-white"><SkipForward /></button>
            <button
              onClick={cycleTextSpeed}
              className="text-white/80 hover:text-white text-xs font-medium px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"
              title="Text animation speed"
            >
              {textSpeed}x
            </button>
            <div
              className="border-l border-white/20 pl-3 md:pl-4"
              title="Theme settings"
            >
              <ThemeSettings />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {list.map((article, index) => (
        <section
          key={index}
          data-index={index}
          className="article-section h-screen w-screen snap-start relative flex items-center justify-center overflow-hidden"
        >
          <div className="absolute inset-0">
            <img src={article?.image} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          </div>

          <div className="relative z-10 p-6 md:p-10 max-w-3xl w-full text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={currentIndex === index ? { opacity: 1, y: 0 } : { opacity: 0 }}>
              <h1 className={"text-3xl md:text-5xl font-bold mb-4 leading-tight drop-shadow-2xl " + getFontSizeClass()} style={{ textShadow: '2px 2px 12px rgba(0,0,0,1)' }}>
                {article?.title}
              </h1>
              
              <div className={"leading-snug mb-6 text-lg md:text-xl font-medium text-white/95 " + getFontSizeClass()} style={{ textShadow: '1px 1px 8px rgba(0,0,0,1)' }}>
                {currentIndex === index ? displayedText : getArticleText(article)}
              </div>
              
              <div className="flex items-center space-x-6">
                <SocialInteractions 
                  article={{
                    ...article,
                    id: article.wikipedia_id || article.id,
                    shareUrl: "https://snippedia.app/s/" + (article.wikipedia_id || article.id)
                  }} 
                />
                <div className="text-sm font-bold bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                   {Number(article?.views || 0).toLocaleString()} views
                </div>
              </div>
            </motion.div>
          </div>

          {currentIndex === index && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
              <motion.div className="h-full bg-red-600" style={{ width: progress + "%" }} />
            </div>
          )}
        </section>
      ))}
    </main>
  );
};

export default ArticleViewer;
