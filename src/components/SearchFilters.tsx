
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Filter, Calendar, FileText } from "lucide-react";

interface SearchFiltersProps {
  selectedCategory: string;
  selectedTags: string[];
  dateRange: string;
  articleSize: string;
  onCategoryChange: (category: string) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onDateRangeChange: (range: string) => void;
  onArticleSizeChange: (size: string) => void;
  onClearFilters: () => void;
}

const CATEGORIES = [
  "All",
  "Science",
  "History", 
  "Technology",
  "Art",
  "Sports",
  "Politics",
  "Geography",
  "Biography",
  "Literature",
  "Philosophy",
  "Mathematics",
  "Medicine",
  "Culture",
  "Environment"
];

const POPULAR_TAGS = [
  "Ancient", "Modern", "War", "Discovery", "Innovation", "Culture",
  "Famous People", "Countries", "Cities", "Nature", "Space", "Medicine",
  "Research", "Theory", "Experiment", "Movement", "Revolution", "Empire"
];

const DATE_RANGES = [
  { value: "all", label: "All time" },
  { value: "recent", label: "Recent (2020+)" },
  { value: "modern", label: "Modern (1900+)" },
  { value: "historical", label: "Historical (pre-1900)" },
  { value: "ancient", label: "Ancient (pre-500)" }
];

const ARTICLE_SIZES = [
  { value: "all", label: "All sizes" },
  { value: "short", label: "Short (< 500 words)" },
  { value: "medium", label: "Medium (500-1500 words)" },
  { value: "long", label: "Long (1500+ words)" },
  { value: "detailed", label: "Very detailed (3000+ words)" }
];

const SearchFilters = ({
  selectedCategory,
  selectedTags,
  dateRange,
  articleSize,
  onCategoryChange,
  onTagAdd,
  onTagRemove,
  onDateRangeChange,
  onArticleSizeChange,
  onClearFilters
}: SearchFiltersProps) => {
  const [showTags, setShowTags] = useState(false);
  const [customTag, setCustomTag] = useState("");

  const hasActiveFilters = selectedCategory !== "All" || 
    selectedTags.length > 0 || 
    dateRange !== "all" || 
    articleSize !== "all";

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      onTagAdd(customTag.trim());
      setCustomTag("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomTagAdd();
    }
  };

  return (
    <div className="space-y-4 p-4 bg-black/30 backdrop-blur-sm rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm font-medium">Advanced Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white h-6 px-2"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-white/70 text-xs font-medium">Category</label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-black/20 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-white/70 text-xs font-medium flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          Time Period
        </label>
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="bg-black/20 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Article Size Filter */}
      <div className="space-y-2">
        <label className="text-white/70 text-xs font-medium flex items-center">
          <FileText className="w-3 h-3 mr-1" />
          Article Length
        </label>
        <Select value={articleSize} onValueChange={onArticleSizeChange}>
          <SelectTrigger className="bg-black/20 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARTICLE_SIZES.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-white/70 text-xs font-medium">Tags</label>
          <Button
            onClick={() => setShowTags(!showTags)}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white h-6 px-2 text-xs"
          >
            {showTags ? "Hide" : "Show"}
          </Button>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-wikitok-red/20 text-wikitok-red border-wikitok-red/30 text-xs"
              >
                {tag}
                <button
                  onClick={() => onTagRemove(tag)}
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tag Input and Popular Tags */}
        {showTags && (
          <div className="space-y-3">
            {/* Custom Tag Input */}
            <div className="flex space-x-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-black/20 border-white/20 text-white placeholder:text-white/40 text-xs"
              />
              <Button
                onClick={handleCustomTagAdd}
                size="sm"
                className="bg-wikitok-red hover:bg-wikitok-red/80 text-xs px-3"
              >
                Add
              </Button>
            </div>

            {/* Popular Tags */}
            <div className="space-y-2">
              <div className="text-white/60 text-xs">Popular tags:</div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_TAGS.filter(tag => !selectedTags.includes(tag)).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagAdd(tag)}
                    className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-md transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
