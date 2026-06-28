
import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import LazyImage from "@/components/LazyImage";
import type { WikipediaArticle } from "@/services/wikipediaService";

type SearchResultItem = WikipediaArticle & { tags?: string[] };

interface SearchResultsProps {
  searchValue: string;
  searchResults: SearchResultItem[] | undefined;
  isLoading: boolean;
  hasActiveFilters: boolean;
  onArticleSelect: (title: string, article?: SearchResultItem) => void;
}

const SearchResults = ({ 
  searchValue, 
  searchResults, 
  isLoading, 
  hasActiveFilters, 
  onArticleSelect 
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="p-2">
        <LoadingSkeleton variant="search" count={3} />
      </div>
    );
  }

  if (!searchResults && searchValue.length > 0) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  if (searchResults && searchResults.length === 0 && searchValue.length > 0) {
    return (
      <CommandEmpty>
        No results found for "{searchValue}"
        {hasActiveFilters && " with selected filters"}
      </CommandEmpty>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading={`Search Results (${searchResults.length})`}>
      {searchResults.map((result) => (
        <CommandItem
          key={result.id}
          onSelect={() => onArticleSelect(result.title, result)}
          className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-lg"
        >
          <div className="flex items-center w-full gap-3">
            {result.image && (
              <LazyImage
                src={result.image}
                alt={result.title}
                className="w-16 h-16 rounded-md flex-shrink-0"
                placeholderClassName="w-16 h-16 rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base">{result.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {result.content}
              </div>
              {Array.isArray(result.tags) && result.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {result.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-muted px-1 rounded text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default SearchResults;
