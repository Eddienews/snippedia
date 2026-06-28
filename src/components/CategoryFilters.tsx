// /home/snippedia/snip-pedia/src/components/CategoryFilters.tsx

import React from "react";

type CategoryItem = {
  label: string;   // o que aparece na UI
  value: string;   // o que vai para o selectedCategory (usado na API)
};

const CATEGORIES: CategoryItem[] = [
  { label: "All", value: "All" },

  // “labels bonitos” → valores realmente úteis pro Wikipedia
  { label: "Tech", value: "Technology" },
  { label: "AI", value: "Artificial intelligence" },
  { label: "Science", value: "Science" },
  { label: "Space", value: "Space" },
  { label: "History", value: "History" },
  { label: "Wars", value: "War" },
  { label: "Politics", value: "Politics" },
  { label: "Business", value: "Business" },
  { label: "Economy", value: "Economics" },
  { label: "Health", value: "Medicine" },
  { label: "Psychology", value: "Psychology" },
  { label: "Nature", value: "Nature" },
  { label: "Animals", value: "Animals" },
  { label: "Sports", value: "Sports" },
  { label: "Movies", value: "Film" },
  { label: "Music", value: "Music" },
  { label: "Gaming", value: "Video games" },
  { label: "Art", value: "Art" },
  { label: "Travel", value: "Travel" },
];

type Props = {
  selectedCategory: string;
  onCategoryChange: (categoryValue: string) => void;
  onCategoryHover?: (categoryValue: string) => void;
};

const CategoryFilters: React.FC<Props> = ({
  selectedCategory,
  onCategoryChange,
  onCategoryHover,
}) => {
  return (
    <div className="px-4 py-3 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.value;

          return (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              onMouseEnter={() => onCategoryHover?.(cat.value)}
              className={[
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
                active
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white",
              ].join(" ")}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilters;
