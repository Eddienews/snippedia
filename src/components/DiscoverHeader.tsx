
import { TrendingUp, User, Globe } from "lucide-react";

interface DiscoverHeaderProps {
  activeSection: "trending" | "foryou" | "explore";
  onSectionChange: (section: "trending" | "foryou" | "explore") => void;
}

const DiscoverHeader = ({ activeSection, onSectionChange }: DiscoverHeaderProps) => {
  const getSectionIcon = (section: string) => {
    switch (section) {
      case "trending": return <TrendingUp className="w-4 h-4" />;
      case "foryou": return <User className="w-4 h-4" />;
      case "explore": return <Globe className="w-4 h-4" />;
      default: return null;
    }
  };

  const getSectionTitle = (section: string) => {
    switch (section) {
      case "trending": return "Trending";
      case "foryou": return "Daily Digest";
      case "explore": return "Explore";
      default: return "Discover";
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-black border-b border-white/10 backdrop-blur-sm">
      <div className="flex space-x-1 px-4 py-2">
        {(["trending", "foryou", "explore"] as const).map((section) => (
          <button
            key={section}
            onClick={() => onSectionChange(section)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
              activeSection === section
                ? "bg-snippedia-red text-white shadow-lg"
                : "bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            }`}
          >
            {getSectionIcon(section)}
            <span>{getSectionTitle(section)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverHeader;
