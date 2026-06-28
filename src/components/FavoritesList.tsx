
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FavoriteCollection, FavoriteItem } from "@/hooks/useFavorites";
import { WikipediaArticle } from "@/services/wikipediaService";

interface FavoritesListProps {
  favorites: FavoriteItem[];
  collections: FavoriteCollection[];
  searchTerm: string;
  selectedCollectionId: string;
  onArticleClick: (article: WikipediaArticle) => void;
  onRemoveFavorite: (articleId: string | number) => void;
  onAssignCollection: (articleId: string | number, collectionId: string) => void;
}

const FavoritesList = ({
  favorites,
  collections,
  searchTerm,
  selectedCollectionId,
  onArticleClick,
  onRemoveFavorite,
  onAssignCollection,
}: FavoritesListProps) => {
  const filteredItems = favorites.filter((item) => {
    const titleMatch = item.article.title.toLowerCase().includes(searchTerm.toLowerCase());
    const collectionMatch = selectedCollectionId === "all" || item.collectionId === selectedCollectionId;
    return titleMatch && collectionMatch;
  });

  const collectionMap = new Map(collections.map((c) => [c.id, c.name]));

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <ScrollArea className="h-96">
      {filteredItems.length === 0 ? (
        <div className="text-center text-white/60 py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg mb-2">
            {searchTerm ? "No results found" : "No favorites saved"}
          </p>
          <p className="text-sm text-white/40">
            {searchTerm ? "Try another search term" : "Save articles as favorites!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={`${item.article.id}-${item.savedAt}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all duration-300 border border-white/10 hover:border-white/20"
                onClick={() => onArticleClick(item.article)}
              >
                <div className="flex items-start space-x-4">
                  {item.article.image && (
                    <img
                      src={item.article.image}
                      alt={item.article.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-base font-medium line-clamp-2 group-hover:text-wikitok-red transition-colors mb-2">
                      {item.article.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">
                        {formatTimeAgo(item.savedAt)}
                      </span>
                      <div className="flex items-center space-x-2">
                        <select
                          value={item.collectionId}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            onAssignCollection(item.article.id, e.target.value);
                          }}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white max-w-[120px]"
                        >
                          {collections.map((collection) => (
                            <option key={collection.id} value={collection.id} className="bg-black text-white">
                              {collection.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(item.article.id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      Collection: {collectionMap.get(item.collectionId) ?? "Saved"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ScrollArea>
  );
};

export default FavoritesList;
