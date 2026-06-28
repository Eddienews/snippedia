
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Share2, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrendingArticles } from '@/hooks/useTrendingArticles';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import LazyImage from '@/components/LazyImage';

interface TrendingArticlesProps {
  limit?: number;
  showCategories?: boolean;
  variant?: 'full' | 'compact' | 'grid';
}

const TrendingArticles = ({ limit = 10, showCategories = true, variant = 'full' }: TrendingArticlesProps) => {
  const { 
    trendingArticles, 
    trendingCategories, 
    isLoading, 
    getTopTrendingToday,
    getTrendIcon,
    getTrendColor 
  } = useTrendingArticles();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton variant="card" count={5} />
      </div>
    );
  }

  const topTrending = getTopTrendingToday(limit);

  if (variant === 'compact') {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-wikitok-red" />
            <span>Trending Now</span>
            <span className="text-wikitok-red animate-pulse">🔥</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topTrending.slice(0, 5).map((article, index) => (
            <motion.div
              key={article.article.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-wikitok-red rounded-full text-white font-bold text-sm">
                #{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-sm font-medium truncate">
                  {article.article.title}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <span className={getTrendColor(article.trend)}>
                    {getTrendIcon(article.trend)} {article.trendPercentage.toFixed(0)}%
                  </span>
                  <span>•</span>
                  <span>{article.recentViews} views today</span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topTrending.map((article, index) => (
          <motion.div
            key={article.article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="relative">
                {article.article.image && (
                  <LazyImage
                    src={article.article.image}
                    alt={article.article.title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-wikitok-red text-white">
                    #{index + 1} Trending
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-lg ${getTrendColor(article.trend)}`}>
                    {getTrendIcon(article.trend)}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h4 className="text-white font-medium mb-2 line-clamp-2 group-hover:text-wikitok-red transition-colors">
                  {article.article.title}
                </h4>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{article.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share2 className="w-3 h-3" />
                      <span>{article.shareCount}</span>
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                </div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">Trending Score</div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-wikitok-red h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, article.trendingScore)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Articles */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-wikitok-red" />
            <span>Trending Articles</span>
            <span className="text-wikitok-red animate-pulse">🔥</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTrending.map((article, index) => (
              <motion.div
                key={article.article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-wikitok-red rounded-full text-white font-bold">
                  #{index + 1}
                </div>
                
                {article.article.image && (
                  <LazyImage
                    src={article.article.image}
                    alt={article.article.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium mb-1 group-hover:text-wikitok-red transition-colors">
                    {article.article.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{article.views} views</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{article.shareCount} shares</span>
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${getTrendColor(article.trend)}`}>
                    {getTrendIcon(article.trend)} {article.trendPercentage.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    Score: {article.trendingScore}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Categories */}
      {showCategories && trendingCategories.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <span>📊</span>
              <span>Trending Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trendingCategories.slice(0, 6).map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-white font-medium">{category.category}</h5>
                    <span className={getTrendColor(category.trend)}>
                      {getTrendIcon(category.trend)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div>{category.articleCount} trending articles</div>
                    <div>{category.totalViews} total views</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-wikitok-red h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, category.trendingScore)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrendingArticles;
