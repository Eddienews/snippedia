
import { Search } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";

interface SearchSuggestionsProps {
  searchValue: string;
  suggestions: string[];
  onSuggestionSelect: (suggestion: string) => void;
}

const SearchSuggestions = ({ searchValue, suggestions, onSuggestionSelect }: SearchSuggestionsProps) => {
  if (searchValue.length <= 1 || suggestions.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Suggestions">
      {suggestions.map((suggestion, index) => (
        <CommandItem
          key={`suggestion-${index}`}
          onSelect={() => onSuggestionSelect(suggestion)}
          className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-lg"
        >
          <Search className="w-4 h-4 text-muted-foreground mr-3" />
          <span>{suggestion}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default SearchSuggestions;
