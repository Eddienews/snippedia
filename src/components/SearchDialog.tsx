
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Clock, 
  TrendingUp, 
  Filter, 
  X, 
  History,
  BookOpen,
  Star
} from "lucide-react";
import { searchArticles, WikipediaArticle } from "../services/wikipediaService";
import { useNavigate } from "react-router-dom";
import IntelligentSearch from "./IntelligentSearch";
import AdvancedFilters from "./AdvancedFilters";
import LazyImage from "./LazyImage";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount: number;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("search");
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [filters, setFilters] = useState({
    category: "all",
    sortBy: "relevance",
    timeRange: "all"
  });
  const navigate = useNavigate();

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("search-history");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = (query: string, resultsCount: number) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      resultsCount
    };
    
    const updated = [newItem, ...searchHistory.filter(item => item.query !== query)]
      .slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(updated);
    localStorage.setItem("search-history", JSON.stringify(updated));
  };

  // Search query with debouncing
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["search", searchValue, filters],
    queryFn: async () => {
      if (searchValue.length < 2) return [];
      const results = await searchArticles(searchValue);
      
      // Apply filters
      let filteredResults = results;
      
      if (filters.category !== "all") {
        filteredResults = results.filter(article => 
          article.tags?.some(tag => 
            tag.toLowerCase().includes(filters.category.toLowerCase())
          )
        );
      }
      
      // Sort results
      if (filters.sortBy === "popularity") {
        filteredResults.sort((a, b) => b.views - a.views);
      } else if (filters.sortBy === "recent") {
        // Sort by readTime as a proxy since timestamp doesn't exist
        filteredResults.sort((a, b) => b.readTime - a.readTime);
      }
      
      return filteredResults;
    },
    enabled: searchValue.length >= 2,
    staleTime: 1000 * 30,
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveToHistory(query, searchResults?.length || 0);
      navigate(`/?q=${encodeURIComponent(query)}`);
      onOpenChange(false);
      setSearchValue("");
    }
  };

  const handleSuggestionSelect = (suggestion: string | WikipediaArticle) => {
    if (typeof suggestion === "string") {
      setSearchValue(suggestion);
      handleSearch(suggestion);
      return;
    }

    const selectedArticle = suggestion;
    const query = selectedArticle.title || searchValue;
    if (!query?.trim()) return;

    saveToHistory(query, searchResults?.length || 0);
    navigate(`/?q=${encodeURIComponent(query)}`, {
      state: { reorderedResults: [selectedArticle] },
    });
    onOpenChange(false);
    setSearchValue("");
  };

  const handleHistoryClick = (historyItem: SearchHistoryItem) => {
    setSearchValue(historyItem.query);
    handleSearch(historyItem.query);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("search-history");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(searchValue);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-black/95 border-white/20 text-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-wikitok-red" />
            <span>Advanced Search</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input with Filters Toggle */}
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search for articles, topics or keywords..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-white/20 ${showFilters ? 'bg-white/20' : ''}`}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              {searchValue.length >= 2 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wikitok-red"></div>
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="grid gap-3">
                      {searchResults.slice(0, 8).map((article) => (
                        <motion.div
                          key={article.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                          onClick={() => handleSuggestionSelect(article)}
                        >
                          {article.image && (
                            <LazyImage
                              src={article.image}
                              alt={article.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{article.title}</h4>
                            <p className="text-sm text-white/60 line-clamp-1">
                              {article.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {article.views.toLocaleString()} views
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {article.readTime}min read
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      No results found for "{searchValue}"
                    </div>
                  )}
                </div>
              ) : (
                <IntelligentSearch
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  onSuggestionSelect={handleSuggestionSelect}
                />
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  Recent Searches
                </h3>
                {searchHistory.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {searchHistory.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {searchHistory.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => handleHistoryClick(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-white/60" />
                        <div>
                          <p className="font-medium">{item.query}</p>
                          <p className="text-xs text-white/60">
                            {new Date(item.timestamp).toLocaleDateString()} • {item.resultsCount} results
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No search history yet</p>
                </div>
              )}
           </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <h3 className="font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-wikitok-red" />
              Trending Topics
            </h3>

            {/* Container com scroll habilitado e altura máxima definida */}
            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {[
                "Artificial Intelligence",
                "Climate Change",
                "Space Exploration",
                "Quantum Computing",
                "Ancient Civilizations",
                "Modern Architecture",
                "Renewable Energy",
                "Virtual Reality",
                "Blockchain Technology",
                "Genetic Engineering"
              ].map((topic, index) => (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                  onClick={() => handleSuggestionSelect(topic)}
                >
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-4 h-4 text-wikitok-red" />
                    <span className="font-medium">{topic}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    #{index + 1}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
