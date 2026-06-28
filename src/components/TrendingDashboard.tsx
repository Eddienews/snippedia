
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTrendingArticles } from '@/hooks/useTrendingArticles';
import { useArticleHistory } from '@/hooks/useArticleHistory';
import { useFavorites } from '@/hooks/useFavorites';
import TrendingArticles from './TrendingArticles';
import LoadingSkeleton from './LoadingSkeleton';
import { TrendingUp, Star, Clock } from 'lucide-react';

const TrendingDashboard = () => {
  const { trendingArticles, isLoading } = useTrendingArticles();
  const { history } = useArticleHistory();
  const { favorites } = useFavorites();

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={3} />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Trending Now
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {trendingArticles.length}
            </div>
            <p className="text-white/60 text-sm">Articles trending</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-400" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {favorites.length}
            </div>
            <p className="text-white/60 text-sm">Articles saved</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-400" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {history.length}
            </div>
            <p className="text-white/60 text-sm">Articles read</p>
          </CardContent>
        </Card>
      </motion.div>

      <TrendingArticles variant="grid" limit={6} />
    </div>
  );
};

export default TrendingDashboard;
