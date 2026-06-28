
import { useState } from "react";
import { Clock, Heart, Search, Trash2 } from "lucide-react";
import { useArticleHistory } from "@/hooks/useArticleHistory";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingStats } from "@/hooks/useReadingStats";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import StatsGrid from "@/components/StatsGrid";
import HistoryList from "@/components/HistoryList";
import FavoritesList from "@/components/FavoritesList";
import { WikipediaArticle } from "@/services/wikipediaService";

const History = () => {
  const { history, clearHistory } = useArticleHistory();
  const {
    favorites,
    collections,
    createCollection,
    assignFavoriteToCollection,
    removeFromFavorites,
    clearFavorites,
  } = useFavorites();
  const { stats, formatTime } = useReadingStats();
  const [activeTab, setActiveTab] = useState<"history" | "favorites">("history");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] = useState("all");
  const [newCollectionName, setNewCollectionName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleArticleClick = (article: WikipediaArticle) => {
    navigate(`/?q=${encodeURIComponent(article.title)}`, {
      state: { reorderedResults: [article] }
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    toast({
      title: "History cleared",
      description: "All history has been removed",
      duration: 2000,
    });
  };

  const handleClearFavorites = () => {
    clearFavorites();
    toast({
      title: "Favorites cleared",
      description: "All favorites have been removed",
      duration: 2000,
    });
  };

  const handleRemoveFavorite = (articleId: string | number) => {
    removeFromFavorites(articleId);
    toast({
      title: "Removed from favorites",
      description: "Article removed successfully",
      duration: 2000,
    });
  };

  const handleCreateCollection = () => {
    const created = createCollection(newCollectionName);
    if (!created) {
      toast({
        title: "Collection not created",
        description: "Use a new non-empty name.",
        duration: 1800,
      });
      return;
    }
    setNewCollectionName("");
    setSelectedCollectionId(created.id);
    toast({
      title: "Collection created",
      description: `"${created.name}" is ready.`,
      duration: 1800,
    });
  };

  const handleAssignCollection = (articleId: string | number, collectionId: string) => {
    assignFavoriteToCollection(articleId, collectionId);
  };

  const filteredItems = activeTab === "history" 
    ? history.filter(item => 
        item.article.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : favorites.filter(item => 
        item.article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCollectionId === "all" || item.collectionId === selectedCollectionId)
      );

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      {/* Header */}
      <div className="px-4 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold mb-2">Your Statistics</h1>
        <p className="text-white/60">Track your reading progress</p>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} formatTime={formatTime} />

      {/* Tabs */}
      <div className="px-4">
        <div className="flex space-x-1 mb-6">
          {["history", "favorites"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "history" | "favorites")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-wikitok-red text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {tab === "history" ? <Clock className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
              <span>{tab === "history" ? "History" : "Favorites"}</span>
            </button>
          ))}
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder={`Search ${activeTab === "history" ? "history" : "favorites"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          
          <button
            onClick={activeTab === "history" ? handleClearHistory : handleClearFavorites}
            className="ml-4 p-2 text-white/60 hover:text-red-400 transition-colors"
            disabled={filteredItems.length === 0}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {activeTab === "favorites" && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2">
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white"
              >
                <option value="all" className="bg-black text-white">All collections</option>
                {collections.map((collection) => (
                  <option key={collection.id} value={collection.id} className="bg-black text-white">
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="New collection name..."
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="max-w-md bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
              <button
                onClick={handleCreateCollection}
                className="rounded-full px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
              >
                Create
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === "history" ? (
          <HistoryList
            history={history}
            searchTerm={searchTerm}
            onArticleClick={handleArticleClick}
            onClearHistory={handleClearHistory}
          />
        ) : (
          <FavoritesList
            favorites={favorites}
            collections={collections}
            searchTerm={searchTerm}
            selectedCollectionId={selectedCollectionId}
            onArticleClick={handleArticleClick}
            onRemoveFavorite={handleRemoveFavorite}
            onAssignCollection={handleAssignCollection}
          />
        )}
      </div>
    </div>
  );
};

export default History;
