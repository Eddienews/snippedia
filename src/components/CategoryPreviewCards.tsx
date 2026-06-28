import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueries } from "@tanstack/react-query";
import { Layers } from "lucide-react";

import {
  WikipediaArticle,
  getTrendingArticlesByCategory,
  getRandomArticlesByCategory,
} from "@/services/wikipediaService";

type Mode = "trending" | "random";

type Props = {
  categories: string[];
  mode?: Mode; // trending ou random
  lang?: string;
  onOpenArticle: (article: WikipediaArticle) => void;
  onPickCategory?: (category: string) => void; // opcional: setSelectedCategory
};

function pickFirstWithImage(list: WikipediaArticle[]) {
  return list.find((a) => !!a.image) ?? null;
}

export default function CategoryPreviewCards({
  categories,
  mode = "trending",
  lang = "en",
  onOpenArticle,
  onPickCategory,
}: Props) {
  const cats = categories.filter((c) => c && c !== "All");

  const results = useQueries({
    queries: cats.map((cat) => ({
      queryKey: ["categoryPreview", mode, lang, cat],
      queryFn: async () => {
        const list =
          mode === "trending"
            ? await getTrendingArticlesByCategory(cat, 6, lang)
            : await getRandomArticlesByCategory(cat, 6, lang);

        return pickFirstWithImage(list);
      },
      staleTime: 60_000,
      retry: 0,
      refetchOnWindowFocus: false,
    })),
  });

  const items = cats.map((cat, i) => ({
    category: cat,
    article: results[i]?.data ?? null,
    loading: results[i]?.isLoading ?? false,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
  <Layers className="w-5 h-5 mr-2 text-wikitok-red" />
  Categories
</CardTitle>
<p className="text-white/60 text-sm">
  One highlight per category — click to open and keep browsing that category.
</p>
        </CardHeader>

        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
  {items.map(({ category, article, loading }) => (
    <motion.button
      key={category}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="min-w-[320px] max-w-[320px] flex-shrink-0 text-left rounded-2xl overflow-hidden border border-white/10 bg-black/30 hover:bg-black/40 transition"
      onClick={() => {
        onPickCategory?.(category);
        if (article) onOpenArticle(article);
      }}
    >
      <div className="aspect-[16/9] bg-black/40">
        {article?.image ? (
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
            {loading ? "Loading..." : "No image"}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs text-white/60 mb-1">{category}</div>
        <div className="text-white font-semibold line-clamp-2">
          {article?.title ?? (loading ? "Fetching..." : "Nothing found")}
        </div>
        {article?.extract && (
          <div className="text-white/60 text-sm mt-2 line-clamp-2">{article.extract}</div>
        )}
      </div>
    </motion.button>
  ))}
</div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
