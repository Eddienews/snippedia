
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";

interface HistoryListProps {
  history: ArticleHistoryItem[];
  searchTerm: string;
  onArticleClick: (article: any) => void;
  onClearHistory: () => void;
}

const HistoryList = ({ history, searchTerm, onArticleClick, onClearHistory }: HistoryListProps) => {
  const filteredItems = history.filter(item => 
    item.article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Clock className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg mb-2">
            {searchTerm ? "No results found" : "No articles in history"}
          </p>
          <p className="text-sm text-white/40">
            {searchTerm ? "Try another search term" : "Start reading some articles!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3 pb-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={`${item.article.id}-${item.viewedAt}`}
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
                        {formatTimeAgo(item.viewedAt)}
                      </span>
                      <div className="flex items-center space-x-3">
                        {item.timeSpent && (
                          <span className="text-white/40">
                            {Math.round(item.timeSpent / 1000)}s read
                          </span>
                        )}
                      </div>
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

export default HistoryList;
