// /home/snippedia/snip-pedia/src/components/RightSidebar.tsx

import { Bookmark, Share2, Edit, BookOpen, Clock, Check } from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import HistoryPanel from "./HistoryPanel";
import { useFavorites } from "@/hooks/useFavorites";

type RightSidebarProps = {
  article?: {
    id?: number | string;
    pageid?: number;
    title?: string;
    image?: string | null;
    content?: string;
    extract?: string;
    description?: string;
    url?: string;
    category?: string;
    views?: number;
  };
};

type SidebarItem = {
  key: string;
  icon: ComponentType<LucideProps>;
  label: string;
  action: () => void;
  active?: boolean;
};

const RightSidebar = ({ article }: RightSidebarProps) => {
  const { toast } = useToast();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTooltips, setShowTooltips] = useState(false);

  const hasArticle = Boolean(article?.title);

  useEffect(() => {
    if (!hasArticle) {
      setIsBookmarked(false);
      return;
    }
    if (article?.id != null) {
      setIsBookmarked(isFavorite(article.id));
      return;
    }
    // Fallback by title when legacy/shared article has no id yet
    setIsBookmarked(isFavorite(`title:${String(article?.title ?? "").trim().toLowerCase()}`));
  }, [hasArticle, article?.id, article?.title, isFavorite]);

  const openWikipedia = (mode: "view" | "edit") => {
    if (!hasArticle) return;
    const title = encodeURIComponent(article!.title!);
    const url =
      mode === "edit"
        ? `https://en.wikipedia.org/w/index.php?title=${title}&action=edit`
        : `https://en.wikipedia.org/wiki/${title}`;

    window.open(url, "_blank", "noopener,noreferrer");

    toast({
      title: mode === "edit" ? "Opening editor" : "Opening Wikipedia",
      description: mode === "edit" ? "Redirecting to Wikipedia editor..." : "Redirecting to the full article...",
      duration: 1800,
    });
  };

const handleShare = async () => {
  if (!hasArticle) return;

  const baseUrl = window.location.origin;

  // ✅ URL para preview (OG tags) via share-server
  const shareUrl =
    article?.id != null
      ? `${baseUrl}/s/${encodeURIComponent(String(article.id))}`
      : `${baseUrl}/?q=${encodeURIComponent(article!.title!)}`;

  const shareText = `Check out this article about ${article!.title} on Snippedia!`;

  if (navigator.share) {
    try {
      await navigator.share({ title: article!.title, text: shareText, url: shareUrl });
      toast({ title: "Shared", description: "Article shared!", duration: 1600 });
    } catch (error) {
      console.error("Share failed:", error);
    }
    return;
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Copied to clipboard.", duration: 1600 });
  } catch (error) {
    console.error("Copy failed:", error);
    toast({ title: "Couldn’t copy link", description: "Your browser blocked clipboard access.", duration: 2000 });
  }
};



  const handleBookmark = () => {
    if (!hasArticle) return;

    const articleId =
      article?.id ??
      `title:${String(article?.title ?? "").trim().toLowerCase()}`;

    if (isBookmarked) {
      removeFromFavorites(articleId);
      setIsBookmarked(false);
      toast({ title: "Removed", description: "Removed from saved.", duration: 1600 });
      return;
    }

    addToFavorites({
      id: String(articleId),
      pageid: typeof article?.pageid === "number" ? article.pageid : undefined,
      title: article!.title!,
      image: article?.image ?? null,
      content: article?.content,
      extract: article?.extract,
      description: article?.description,
      url: article?.url,
      category: article?.category,
      views: article?.views,
    });
    setIsBookmarked(true);
    toast({ title: "Saved", description: "Added to saved.", duration: 1600 });
  };

  const items: SidebarItem[] = useMemo(() => {
    if (!hasArticle) {
      return [
        {
          key: "history",
          icon: Clock,
          label: "History",
          action: () => setShowHistory(true),
        },
      ];
    }

    return [
      {
        key: "save",
        icon: Bookmark,
        label: isBookmarked ? "Saved" : "Save",
        action: handleBookmark,
        active: isBookmarked,
      },
      {
        key: "history",
        icon: Clock,
        label: "History",
        action: () => setShowHistory(true),
      },
      {
        key: "share",
        icon: Share2,
        label: "Share",
        action: handleShare,
      },
      {
        key: "edit",
        icon: Edit,
        label: "Edit",
        action: () => openWikipedia("edit"),
      },
      {
        key: "view",
        icon: BookOpen,
        label: "View",
        action: () => openWikipedia("view"),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasArticle, isBookmarked, article?.title, article?.id]);

  return (
    <>
      <motion.aside
        className="fixed right-3 md:right-4 bottom-20 md:bottom-24 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
        onMouseEnter={() => setShowTooltips(true)}
        onMouseLeave={() => setShowTooltips(false)}
      >
        {/* glass rail */}
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-black/35 backdrop-blur-xl border border-white/10 shadow-2xl px-2.5 py-4">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: index * 0.03 }}
                  className="relative flex flex-col items-center"
                >
                  <motion.button
                    type="button"
                    onClick={item.action}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.96 }}
                    className={[
                      "relative grid place-items-center",
                      "h-12 w-12 md:h-12 md:w-12",
                      "rounded-2xl",
                      "bg-white/5 hover:bg-white/10",
                      "border border-white/10 hover:border-white/20",
                      "text-white/85 hover:text-white",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-white/20",
                      "touch-target",
                      item.active ? "ring-2 ring-yellow-400/30" : "",
                    ].join(" ")}
                    aria-label={item.label}
                    title={showTooltips ? "" : item.label}
                  >
                    <Icon className="h-6 w-6" />

                    {/* active dot */}
                    {item.active && (
                      <motion.span
                        className="absolute -top-1 -right-1 grid place-items-center h-5 w-5 rounded-full bg-yellow-400 text-black shadow"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 520, damping: 26 }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </motion.span>
                    )}
                  </motion.button>

                  {/* label */}
                  <span className="mt-1.5 text-[11px] md:text-xs text-white/70 font-medium select-none">
                    {item.label}
                  </span>

                  {/* tooltip */}
                  <AnimatePresence>
                    {showTooltips && (
                      <motion.div
                        initial={{ opacity: 0, x: 8, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 8, scale: 0.98 }}
                        className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs whitespace-nowrap pointer-events-none"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.aside>

      <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
};

export default RightSidebar;
