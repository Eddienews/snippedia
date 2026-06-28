
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";

interface Filters {
  category: string;
  sortBy: string;
  timeRange: string;
}

interface AdvancedFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "science", label: "Science" },
    { value: "history", label: "History" },
    { value: "technology", label: "Technology" },
    { value: "arts", label: "Arts & Culture" },
    { value: "nature", label: "Nature" },
    { value: "biography", label: "Biography" },
    { value: "geography", label: "Geography" },
  ];

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "popularity", label: "Most Popular" },
    { value: "recent", label: "Most Recent" },
    { value: "alphabetical", label: "Alphabetical" },
  ];

  const timeRanges = [
    { value: "all", label: "All Time" },
    { value: "day", label: "Last 24 Hours" },
    { value: "week", label: "Last Week" },
    { value: "month", label: "Last Month" },
    { value: "year", label: "Last Year" },
  ];

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      category: "all",
      sortBy: "relevance", 
      timeRange: "all"
    });
  };

  const hasActiveFilters = filters.category !== "all" || 
                          filters.sortBy !== "relevance" || 
                          filters.timeRange !== "all";

  return (
    <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Category</label>
          <Select value={filters.category} onValueChange={(value) => updateFilter("category", value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Sort By</label>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Time Range</label>
          <Select value={filters.timeRange} onValueChange={(value) => updateFilter("timeRange", value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
          <span className="text-sm text-white/60">Active filters:</span>
          {filters.category !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {categories.find(c => c.value === filters.category)?.label}
            </Badge>
          )}
          {filters.sortBy !== "relevance" && (
            <Badge variant="secondary" className="text-xs">
              {sortOptions.find(s => s.value === filters.sortBy)?.label}
            </Badge>
          )}
          {filters.timeRange !== "all" && (
            <Badge variant="secondary" className="text-xs">
              {timeRanges.find(t => t.value === filters.timeRange)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
