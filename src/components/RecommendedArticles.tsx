
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { FavoriteItem } from "@/hooks/useFavorites";
import { Sparkles, TrendingUp, Heart } from "lucide-react";

interface RecommendedArticlesProps {
  favorites: FavoriteItem[];
  history: ArticleHistoryItem[];
}

const RecommendedArticles = ({ favorites, history }: RecommendedArticlesProps) => {
  // Simulate recommendations based on history and favorites
  const getRecommendations = () => {
    const recommendations = [
      {
        id: 1,
        title: "Artificial Intelligence and Machine Learning",
        reason: "Based on your interest in technology",
        category: "Science",
        readTime: 8,
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop",
        type: "trending"
      },
      {
        id: 2,
        title: "History of Modern Art",
        reason: "Popular category among your favorites",
        category: "Art",
        readTime: 12,
        image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=200&fit=crop",
        type: "favorite"
      },
      {
        id: 3,
        title: "Behavioral Psychology",
        reason: "Trending topic",
        category: "Psychology",
        readTime: 6,
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
        type: "trending"
      }
    ];

    return recommendations;
  };

  const recommendations = getRecommendations();

  const getIcon = (type: string) => {
    switch (type) {
      case "favorite":
        return <Heart className="w-4 h-4" />;
      case "trending":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "favorite":
        return "Based on favorites";
      case "trending":
        return "Trending";
      default:
        return "Recommended";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-wikitok-red" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 hover:border-wikitok-red/50 transition-all duration-300 cursor-pointer overflow-hidden">
                  <div className="relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-black/60 text-white border-0">
                        {getIcon(article.type)}
                        <span className="ml-1 text-xs">{getTypeLabel(article.type)}</span>
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-wikitok-red transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-3">{article.reason}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                        {article.category}
                      </Badge>
                      <span className="text-white/40 text-xs">{article.readTime}min</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              className="bg-gradient-to-r from-wikitok-red to-pink-500 hover:opacity-90 text-white border-0"
            >
              View More Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendedArticles;
