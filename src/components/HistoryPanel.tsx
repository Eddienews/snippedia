import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Trash2 } from "lucide-react";
import { useArticleHistory } from "../hooks/useArticleHistory";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { WikipediaArticle } from "@/services/wikipediaService";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel = ({ isOpen, onClose }: HistoryPanelProps) => {
  const { history, clearHistory } = useArticleHistory();
  const navigate = useNavigate();

  const handleArticleClick = (article: WikipediaArticle) => {
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: { reorderedResults: [article] },
    });
    onClose();
  };

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

  // ✅ render nothing when closed
  if (!isOpen) return null;

  const ui = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-md border-l border-white/10 z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-wikitok-red" />
                <span className="text-white font-medium">History</span>
              </div>
              <div className="flex items-center space-x-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-1 text-white/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="text-center text-white/60 mt-8">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No articles viewed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <motion.div
                      key={`${item.article.id}-${item.viewedAt}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-300"
                      onClick={() => handleArticleClick(item.article)}
                    >
                      <div className="flex items-start space-x-3">
                        {item.article.image && (
                          <img
                            src={item.article.image}
                            alt={item.article.title}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-wikitok-red transition-colors">
                            {item.article.title}
                          </h3>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-white/60 text-xs">
                              {formatTimeAgo(item.viewedAt)}
                            </span>
                            {item.timeSpent != null && (
                              <span className="text-white/40 text-xs">
                                {Math.round(item.timeSpent / 1000)}s read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // ✅ Always attach to document.body to avoid “fixed inside transformed parent” bugs
  return createPortal(ui, document.body);
};

export default HistoryPanel;
