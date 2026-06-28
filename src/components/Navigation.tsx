import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Compass, History as HistoryIcon, Heart, Clock } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { useArticleHistory } from "../hooks/useArticleHistory";
import { useFavorites } from "../hooks/useFavorites";
import HistoryPanel from "./HistoryPanel";
import SearchDialog from "./SearchDialog";
import MobileMenu from "./MobileMenu";
import ThemeSettings from "./ThemeSettings";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<LucideProps>;
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // (opcional – usado se você abrir o menu animado daqui)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { history } = useArticleHistory();
  const { favorites } = useFavorites();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleHistory = () => setIsHistoryOpen((v) => !v);

  const navItems: NavItemProps[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    // { href: "/dashboard", label: "Dashboard", icon: BarChart3 }, // removido
    { href: "/history", label: "History", icon: HistoryIcon },
  ];

  return (
    <nav className="bg-black/80 backdrop-blur-md fixed top-0 left-0 right-0 z-40 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <MobileMenu />
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/uploads/6a3c8d34-e572-4827-a640-1c6bd34068c4.png"
            alt="Snippedia"
            className="h-16 w-auto"
            style={{ width: "400px", height: "100px", objectFit: "contain" }}
          />
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="text-white/80 hover:text-white transition-colors flex items-center space-x-2"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions (sem avatar/perfil) */}
        <div className="flex items-center space-x-4">
          {/* Search - Mobile */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden text-white/60 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* History Button */}
          <button
            onClick={toggleHistory}
            className="text-white/60 hover:text-white transition-colors relative"
          >
            <Clock className="w-5 h-5" />
            {history.length > 0 && (
              <div className="absolute top-[-5px] right-[-5px] bg-snippedia-red rounded-full w-4 h-4 text-white text-xs flex items-center justify-center">
                {history.length}
              </div>
            )}
          </button>

          {/* Favorites (pode manter mesmo sem “Save” na lateral, fica só contador local) */}
          <Link
            to="/history"
            className="text-white/60 hover:text-white transition-colors relative hidden md:block"
          >
            <Heart className="w-5 h-5" />
            {favorites.length > 0 && (
              <div className="absolute top-[-5px] right-[-5px] bg-snippedia-red rounded-full w-4 h-4 text-white text-xs flex items-center justify-center">
                {favorites.length}
              </div>
            )}
          </Link>

          {/* Tema – Desktop */}
          <div className="hidden md:block">
            <ThemeSettings />
          </div>

          {/* Search – Desktop */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:block text-white/60 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* (Opcional) menu animado mobile baseado em isMenuOpen – pode remover se não usar */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 left-0 w-full bg-black/90 backdrop-blur-md z-30 p-4 rounded-b-lg shadow-lg"
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-white/80 hover:text-white transition-colors flex items-center space-x-2 py-2 px-4 rounded-md hover:bg-white/10"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <HistoryPanel isOpen={isHistoryOpen} onClose={toggleHistory} />
        <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      </div>
    </nav>
  );
};

export default Navigation;
