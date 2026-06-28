
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchArticles } from "../services/wikipediaService";
import { ChevronDown, Clock, TrendingUp, Search } from "lucide-react";

interface AutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: string) => void;
  placeholder?: string;
}

const AutoComplete = ({ value, onChange, onSelect, placeholder = "Search articles..." }: AutoCompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Generate smart suggestions based on input
  const getSuggestions = (query: string) => {
    if (query.length < 2) return [];

    const suggestions = [
      // Context-aware suggestions
      ...(query.toLowerCase().includes('war') ? ['World War II', 'Cold War', 'Civil War'] : []),
      ...(query.toLowerCase().includes('space') ? ['Space Exploration', 'NASA', 'Apollo Mission'] : []),
      ...(query.toLowerCase().includes('science') ? ['Albert Einstein', 'Marie Curie', 'Quantum Physics'] : []),
      
      // Popular searches
      'Ancient Rome', 'Leonardo da Vinci', 'Climate Change', 'Artificial Intelligence',
      'Renaissance', 'Egyptian Pyramids', 'Black Holes', 'Human Evolution',
      
      // Recent trending topics
      'Mars Exploration', 'Renewable Energy', 'Cryptocurrency', 'Virtual Reality'
    ];

    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().split(' ').some(word => 
          suggestion.toLowerCase().includes(word.toLowerCase())
        )
      )
      .slice(0, 8);
  };

  // Real-time search results for preview
  const { data: searchResults } = useQuery({
    queryKey: ["autocomplete-search", value],
    queryFn: () => searchArticles(value),
    enabled: value.length >= 3,
    staleTime: 1000 * 30, // 30 seconds
  });

  const suggestions = getSuggestions(value);
  const allOptions = [
    ...suggestions.map(s => ({ type: 'suggestion', text: s })),
    ...(searchResults || []).slice(0, 4).map(r => ({ type: 'result', text: r.title, article: r }))
  ];

  useEffect(() => {
    if (highlightedIndex >= allOptions.length) {
      setHighlightedIndex(allOptions.length - 1);
    }
  }, [allOptions.length, highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && allOptions[highlightedIndex]) {
          onSelect(allOptions[highlightedIndex].text);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(newValue.length > 0);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: any) => {
    onSelect(option.text);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-10 text-sm bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-wikitok-red/50 focus:border-wikitok-red/50"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && allOptions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl max-h-64 overflow-y-auto z-50 shadow-2xl"
        >
          {allOptions.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSuggestion = option.type === 'suggestion';
            
            return (
              <li
                key={`${option.type}-${index}`}
                className={`px-4 py-3 cursor-pointer transition-colors ${
                  isHighlighted 
                    ? 'bg-wikitok-red/20 text-white' 
                    : 'text-white/80 hover:bg-white/10'
                }`}
                onClick={() => handleOptionClick(option)}
              >
                <div className="flex items-center space-x-3">
                  {isSuggestion ? (
                    <TrendingUp className="w-4 h-4 text-wikitok-red" />
                  ) : (
                    <Search className="w-4 h-4 text-blue-400" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.text}</div>
                    {!isSuggestion && (
                      <div className="text-xs text-white/60 mt-1">
                        Search result
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AutoComplete;
