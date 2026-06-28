
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Star, BookOpen } from "lucide-react";
import { searchArticles } from "../services/wikipediaService";
import type { WikipediaArticle } from "../services/wikipediaService";
import { useArticleHistory } from "../hooks/useArticleHistory";

interface IntelligentSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSuggestionSelect: (suggestion: string | WikipediaArticle) => void;
}

interface SmartSuggestion {
  text: string;
  type: 'trending' | 'recent' | 'popular' | 'related';
  icon: React.ComponentType<{ className?: string }>;
  score: number;
}

const IntelligentSearch = ({ searchValue, onSearchChange, onSuggestionSelect }: IntelligentSearchProps) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const { getRecentArticles } = useArticleHistory();

  // Real-time search with debouncing
  const { data: searchResults } = useQuery({
    queryKey: ["intelligent-search", searchValue],
    queryFn: async () => {
      if (searchValue.length < 2) return [];
      return await searchArticles(searchValue);
    },
    enabled: searchValue.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  });

  // Generate intelligent suggestions
  const smartSuggestions = useMemo(() => {
    if (searchValue.length < 2) return [];

    const recentArticles = getRecentArticles(10);
    const suggestions: SmartSuggestion[] = [];

    // Trending topics based on current search
    const trendingTopics = [
      "Artificial Intelligence", "Climate Change", "Space Exploration", 
      "Quantum Computing", "Renewable Energy", "Biotechnology"
    ];

    // Popular searches
    const popularSearches = [
      "World War II", "Ancient Rome", "Albert Einstein", "Leonardo da Vinci",
      "Black Holes", "Evolution", "Renaissance", "Ancient Egypt"
    ];

    // Related terms based on search context
    const getRelatedTerms = (query: string) => {
      const lowerQuery = query.toLowerCase();
      const relatedMap: Record<string, string[]> = {
        'science': ['physics', 'chemistry', 'biology', 'astronomy'],
        'history': ['ancient', 'medieval', 'renaissance', 'modern'],
        'art': ['painting', 'sculpture', 'architecture', 'literature'],
        'technology': ['computer', 'internet', 'artificial intelligence', 'robotics'],
        'space': ['planet', 'galaxy', 'universe', 'astronaut'],
        'war': ['battle', 'military', 'conflict', 'strategy']
      };

      for (const [key, terms] of Object.entries(relatedMap)) {
        if (lowerQuery.includes(key)) {
          return terms;
        }
      }
      return [];
    };

    // Add trending suggestions
    trendingTopics
      .filter(topic => topic.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 2)
      .forEach(topic => {
        suggestions.push({
          text: topic,
          type: 'trending',
          icon: TrendingUp,
          score: 90
        });
      });

    // Add recent history suggestions
    recentArticles
      .filter(item => item.article.title.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 3)
      .forEach(item => {
        suggestions.push({
          text: item.article.title,
          type: 'recent',
          icon: Clock,
          score: 80
        });
      });

    // Add popular suggestions
    popularSearches
      .filter(search => search.toLowerCase().includes(searchValue.toLowerCase()))
      .slice(0, 2)
      .forEach(search => {
        suggestions.push({
          text: search,
          type: 'popular',
          icon: Star,
          score: 70
        });
      });

    // Add related suggestions
    const relatedTerms = getRelatedTerms(searchValue);
    relatedTerms.slice(0, 2).forEach(term => {
      suggestions.push({
        text: `${searchValue} ${term}`,
        type: 'related',
        icon: BookOpen,
        score: 60
      });
    });

    // Sort by score and relevance
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [searchValue, getRecentArticles]);

  useEffect(() => {
    setSuggestions(smartSuggestions);
  }, [smartSuggestions]);

  const getSuggestionBadge = (type: SmartSuggestion['type']) => {
    const badges = {
      trending: { text: "Trending", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      recent: { text: "Recent", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      popular: { text: "Popular", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      related: { text: "Related", className: "bg-green-500/20 text-green-400 border-green-500/30" }
    };
    return badges[type];
  };

  if (searchValue.length < 2) return null;

  return (
    <div className="space-y-2">
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <CommandGroup heading="Smart Suggestions">
          {suggestions.map((suggestion, index) => {
            const badge = getSuggestionBadge(suggestion.type);
            const Icon = suggestion.icon;
            
            return (
              <CommandItem
                key={`smart-${index}`}
                onSelect={() => onSuggestionSelect(suggestion.text)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{suggestion.text}</span>
                </div>
                <Badge variant="outline" className={badge.className}>
                  {badge.text}
                </Badge>
              </CommandItem>
            );
          })}
        </CommandGroup>
      )}

      {/* Real-time Results Preview */}
      {searchResults && searchResults.length > 0 && (
        <CommandGroup heading={`Results Preview (${searchResults.length})`}>
          {searchResults.slice(0, 3).map((result) => (
            <CommandItem
              key={result.id}
              onSelect={() => onSuggestionSelect(result)}
              className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-accent rounded-lg"
            >
              {result.image && (
                <img 
                  src={result.image} 
                  alt={result.title}
                  className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{result.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {result.content}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </div>
  );
};

export default IntelligentSearch;
