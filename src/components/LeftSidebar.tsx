import { Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type LeftSidebarProps = {
  article?: {
    tags?: string[];
    relatedArticles?: RelatedArticle[];
  };
  onTagClick?: (tag: string) => void;
};

type RelatedArticle = { id?: string | number; title: string; image?: string };

const LeftSidebar = ({ article, onTagClick }: LeftSidebarProps) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/?q=${encodeURIComponent(tag)}`);
    onTagClick?.(tag); // opcional
  };

  const handleRelatedClick = (related: RelatedArticle) => {
    navigate(`/?q=${encodeURIComponent(related.title)}`, {
      state: { reorderedResults: [related] },
    });
  };

  const tags = article?.tags ?? [];
  const related = article?.relatedArticles ?? [];

  // Se não houver nada para mostrar, não renderiza (ou mantenha o container vazio)
  if (tags.length === 0 && related.length === 0) return null;

  return (
    <motion.div
      className="fixed left-2 md:left-4 bottom-32 md:bottom-20 flex flex-col space-y-4 md:space-y-6 z-30 max-w-[200px] md:max-w-none"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Tags */}
      {tags.length > 0 && (
        <div className="space-y-2 md:space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1 md:mb-2 hidden md:block"
          >
            Tags
          </motion.div>
          <AnimatePresence>
            {tags.slice(0, 3).map((tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm bg-black/60 backdrop-blur-sm px-2 md:px-4 py-1 md:py-2 rounded-full hover:bg-black/80 hover:scale-105 transition-all duration-300 cursor-pointer border border-white/10 hover:border-wikitok-red/50"
                onClick={() => handleTagClick(tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Hash className="w-2 h-2 md:w-3 md:h-3 text-wikitok-red flex-shrink-0" />
                <span className="text-xs font-medium truncate">{tag}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Related (desktop) */}
      {related.length > 0 && (
        <div className="space-y-2 md:space-y-3 hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2"
          >
            Related
          </motion.div>
          <div className="space-y-2">
            <AnimatePresence>
              {related.slice(0, 3).map((r, index) => (
                <motion.div
                  key={r.id ?? r.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="relative group cursor-pointer"
                  onClick={() => handleRelatedClick(r)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-wikitok-red transition-all duration-300 shadow-lg">
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute left-10 md:left-12 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                    {r.title}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LeftSidebar;
