// /home/snippedia/snip-pedia/src/hooks/useDiscoverActions.ts

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { clearUsedArticlesCache } from "@/services/wikipediaService";

type Section = "trending" | "foryou" | "explore";

export const useDiscoverActions = (
  selectedCategory: string,
  activeSection: Section,
  setSelectedCategory: (category: string) => void,
  setActiveSection: (section: Section) => void
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const key = (cat: string, sec: Section) => ["discover", cat, sec] as const;

  const handleCategoryChange = async (category: string) => {
    if (!category || category === selectedCategory) return;

    // variedade
    clearUsedArticlesCache();

    // ✅ mude estado — isso muda a queryKey no useDiscoverData
    setSelectedCategory(category);

    toast({
      title: `Loading ${category} articles`,
      description: "Finding new content...",
      duration: 1400,
    });

    // ✅ marca como stale (o hook novo vai buscar sozinho)
    await queryClient.invalidateQueries({ queryKey: key(category, activeSection) });

    // (opcional) cancela fetch antigo para evitar “piscar” com dados velhos
    await queryClient.cancelQueries({ queryKey: key(selectedCategory, activeSection) });
  };

  const handleSectionChange = async (section: Section) => {
    if (!section || section === activeSection) return;

    clearUsedArticlesCache();

    setActiveSection(section);

    const sectionNames: Record<Section, string> = {
      trending: "Trending",
      foryou: "For You",
      explore: "Explore",
    };

    toast({
      title: `Loading ${sectionNames[section]}`,
      description: "Updating your feed...",
      duration: 1400,
    });

    await queryClient.invalidateQueries({ queryKey: key(selectedCategory, section) });
    await queryClient.cancelQueries({ queryKey: key(selectedCategory, activeSection) });
  };

  const handleRefreshArticles = async () => {
    clearUsedArticlesCache();

    toast({
      title: "Refreshing articles",
      description: "Finding new content...",
      duration: 1400,
    });

    // invalida o feed atual
    await queryClient.invalidateQueries({ queryKey: key(selectedCategory, activeSection) });
  };

  return {
    handleCategoryChange,
    handleSectionChange,
    handleRefreshArticles,
  };
};
