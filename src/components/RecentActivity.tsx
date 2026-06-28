
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { Clock, BookOpen, Eye } from "lucide-react";

interface RecentActivityProps {
  history: ArticleHistoryItem[];
}

const RecentActivity = ({ history }: RecentActivityProps) => {
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

  const formatReadTime = (timeSpent?: number) => {
    if (!timeSpent) return "< 1min";
    const minutes = Math.round(timeSpent / 60000);
    return `${minutes}min`;
  };

  const recentItems = history.slice(0, 10);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Recent Activity</h2>
        <p className="text-white/60">Your latest read articles</p>
      </motion.div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-wikitok-red" />
            Detailed History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activity recorded yet</p>
              <p className="text-sm mt-2">Start reading some articles!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentItems.map((item, index) => (
                <motion.div
                  key={`${item.article.id}-${item.viewedAt}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  {item.article.image && (
                    <img
                      src={item.article.image}
                      alt={item.article.title}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium line-clamp-2 group-hover:text-wikitok-red transition-colors">
                      {item.article.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-white/60 text-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {formatTimeAgo(item.viewedAt)}
                      </div>
                      {item.timeSpent && (
                        <div className="flex items-center text-white/60 text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatReadTime(item.timeSpent)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="border-white/20 text-white/60">
                      Read
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentActivity;
