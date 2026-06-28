
import { TrendingUp } from "lucide-react";
import { WikipediaArticle } from "@/services/wikipediaService";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LazyImage from "@/components/LazyImage";

interface ArticleGridProps {
  articles: WikipediaArticle[];
  activeSection: "trending" | "foryou" | "explore";
  isLoading: boolean;
  onArticleClick: (article: WikipediaArticle) => void;
}

const ArticleGrid = ({ articles, activeSection, isLoading, onArticleClick }: ArticleGridProps) => {
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "trending": return <TrendingUp className="w-4 h-4" />;
      case "foryou": return <span className="text-blue-400">✨</span>;
      case "explore": return <span className="text-green-400">🌍</span>;
      default: return null;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "trending": return "Trending";
      case "foryou": return "For You";
      case "explore": return "Explore";
      default: return "Discover";
    }
  };

  if (isLoading) {
    return (
      <div className="px-2 pt-4">
        <LoadingSkeleton variant="card" count={12} className="col-span-2 md:col-span-3 lg:col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" />
      </div>
    );
  }

  return (
    <div className="px-2 pt-4">
      {/* Section Header */}
      <div className="mb-4 px-2 animate-fade-in">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          {getSectionIcon(activeSection)}
          <span>{getSectionTitle(activeSection)}</span>
          {activeSection === "trending" && <span className="text-wikitok-red animate-pulse">🔥</span>}
          {activeSection === "foryou" && <span className="text-blue-400 animate-pulse">✨</span>}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {activeSection === "trending" && "Most popular articles right now"}
          {activeSection === "foryou" && "Recommended based on your history"}
          {activeSection === "explore" && "Discover new content"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {articles.map((article: WikipediaArticle, index) => (
          <div
            key={`${article.id}-${article.title}-${index}`}
            className="relative aspect-[9/16] group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:z-10 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onArticleClick(article)}
          >
            <LazyImage
              src={article.image}
              alt={article.title}
              className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
              placeholderClassName="rounded-xl"
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 rounded-xl transition-all duration-300 group-hover:from-black/20 group-hover:to-black/95" />
            
            {/* Trending Badge */}
            {activeSection === "trending" && index < 3 && (
              <div className="absolute top-3 left-3 bg-wikitok-red text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 animate-pulse">
                <TrendingUp className="w-3 h-3" />
                <span>#{index + 1}</span>
              </div>
            )}
            
            {/* For You Badge */}
            {activeSection === "foryou" && (
              <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                ✨ For You
              </div>
            )}
            
            <div className="absolute bottom-0 p-4 w-full transform transition-all duration-300 group-hover:translate-y-0">
              <h3 className="text-sm font-semibold line-clamp-2 mb-2 transition-colors duration-300 group-hover:text-white">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                <span>{article.views.toLocaleString()} views</span>
                <span>{article.readTime}min</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleGrid;
