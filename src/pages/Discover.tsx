import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import DiscoverHeader from "@/components/DiscoverHeader";
import CategoryFilters from "@/components/CategoryFilters";
import ArticleGrid from "@/components/ArticleGrid";
import RefreshButton from "@/components/RefreshButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import TrendingDashboard from "@/components/TrendingDashboard";
import { useDiscoverData } from "@/hooks/useDiscoverData";
import { useDiscoverActions } from "@/hooks/useDiscoverActions";
import { useArticleNavigation } from "@/hooks/useArticleNavigation";
import { useDailyDigest } from "@/hooks/useDailyDigest";
import { readOfflineArticles, saveOfflineArticles } from "@/services/offlineArticleCache";

const Discover = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeSection, setActiveSection] = useState<"trending" | "foryou" | "explore">("trending");
  const { ref, inView } = useInView();
  const { digest, isLoading: isLoadingDigest, refreshDigest, digestDate } = useDailyDigest();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useDiscoverData(
    selectedCategory,
    activeSection
  );

  const {
    handleCategoryChange,
    handleSectionChange,
    handleRefreshArticles,
  } = useDiscoverActions(
    selectedCategory,
    activeSection,
    setSelectedCategory,
    setActiveSection
  );

  const { handleArticleClick } = useArticleNavigation(selectedCategory);
  const isDailyDigestMode = activeSection === "foryou";

  useEffect(() => {
    if (activeSection === "foryou" && selectedCategory !== "All") {
      setSelectedCategory("All");
    }
  }, [activeSection, selectedCategory]);

  useEffect(() => {
    if (isDailyDigestMode) return;
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isDailyDigestMode]);

  const apiArticles = useMemo(() => data?.pages.flat() ?? [], [data]);
  const discoverCacheKey = `discover:${activeSection}:${selectedCategory}`;
  const offlineDiscoverArticles = readOfflineArticles(discoverCacheKey);
  const usingOfflineDiscover =
    !isDailyDigestMode && apiArticles.length === 0 && offlineDiscoverArticles.length > 0;

  const articles =
    isDailyDigestMode
      ? digest
      : apiArticles.length > 0
        ? apiArticles
        : offlineDiscoverArticles;
  const isSectionLoading = isDailyDigestMode ? isLoadingDigest : isLoading;

  const sectionTitle = isDailyDigestMode
    ? `🗓️ Daily Digest • ${digestDate}`
    : activeSection === "trending"
      ? `🔥 Trending in ${selectedCategory}`
      : `📚 Category: ${selectedCategory}`;

  const handleRefresh = async () => {
    if (isDailyDigestMode) {
      await refreshDigest();
      return;
    }
    await handleRefreshArticles();
  };

  useEffect(() => {
    if (isDailyDigestMode) return;
    if (apiArticles.length > 0) {
      saveOfflineArticles(discoverCacheKey, apiArticles);
    }
  }, [apiArticles, discoverCacheKey, isDailyDigestMode]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {usingOfflineDiscover && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-amber-500/95 text-black text-center py-2 text-xs font-semibold">
          You’re viewing offline content
        </div>
      )}
      <DiscoverHeader
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {!isDailyDigestMode && (
        <CategoryFilters
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          onCategoryHover={() => {}}
        />
      )}

      <div className="p-4 space-y-6">
        {activeSection === "trending" && <TrendingDashboard />}

        <div className="relative">
          {isDailyDigestMode && (
            <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
              <div className="text-sm font-semibold">Your Daily Digest is ready</div>
              <div className="text-xs text-emerald-100/80">
                Personalized picks for {digestDate}. Tap refresh for a new selection.
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">{sectionTitle}</h2>
            <RefreshButton onRefresh={handleRefresh} />
          </div>

          {isSectionLoading && articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner />
              <p className="text-white/60 mt-4">
                {isDailyDigestMode ? "Building your daily picks..." : `Loading ${selectedCategory} articles...`}
              </p>
            </div>
          ) : (
            <ArticleGrid
              key={`${selectedCategory}-${activeSection}`}
              articles={articles}
              activeSection={activeSection}
              isLoading={isSectionLoading}
              onArticleClick={handleArticleClick}
            />
          )}

          {!isDailyDigestMode && isFetchingNextPage && (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          )}

          {!isDailyDigestMode && <div ref={ref} className="h-20" />}
        </div>
      </div>
    </div>
  );
};

export default Discover;
