
import { History } from "lucide-react";
import { CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import LazyImage from "@/components/LazyImage";

interface RecentArticlesProps {
  searchValue: string;
  recentArticles: any[];
  onArticleSelect: (title: string, article?: any) => void;
}

const RecentArticles = ({ searchValue, recentArticles, onArticleSelect }: RecentArticlesProps) => {
  if (searchValue || recentArticles.length === 0) {
    if (!searchValue && recentArticles.length === 0) {
      return <CommandEmpty>Start typing to search articles</CommandEmpty>;
    }
    return null;
  }

  return (
    <CommandGroup heading="Recent Articles">
      {recentArticles.map((item) => (
        <CommandItem
          key={`recent-${item.article.id}-${item.viewedAt}`}
          onSelect={() => onArticleSelect(item.article.title, item.article)}
          className="flex items-center p-2 cursor-pointer hover:bg-accent rounded-lg"
        >
          <div className="flex items-center w-full gap-3">
            <History className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {item.article.image && (
              <LazyImage
                src={item.article.image}
                alt={item.article.title}
                className="w-16 h-16 rounded-md flex-shrink-0"
                placeholderClassName="w-16 h-16 rounded-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base">{item.article.title}</div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {item.article.content}
              </div>
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
};

export default RecentArticles;
