
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Compass, History, Search, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SearchDialog from "./SearchDialog";
import ThemeSettings from "./ThemeSettings";

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Discover", path: "/discover" },
    { icon: History, label: "History", path: "/history" },
    { icon: Search, label: "Search", action: "search" },
    { icon: Settings, label: "Theme Settings", action: "theme" },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action === "search") {
      setIsSearchOpen(true);
    } else if (item.action === "theme") {
      setIsThemeOpen(true);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="md:hidden">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <button className="p-2 text-white hover:text-snippedia-red transition-colors touch-target">
              <Menu className="w-6 h-6" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="bg-black border-white/10">
            <DrawerHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <DrawerTitle className="text-white text-lg font-bold">
                  Menu
                </DrawerTitle>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </DrawerHeader>
            
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === location.pathname;
                
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 touch-target ${
                      isActive 
                        ? "bg-snippedia-red text-white" 
                        : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
            
            <div className="p-4 pt-0">
              <div className="border-t border-white/10 pt-4">
                <p className="text-white/60 text-xs text-center">
                  Swipe up/down to navigate articles
                </p>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      
      {/* Theme Settings Dialog */}
      {isThemeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ThemeSettings />
          </div>
          <button 
            onClick={() => setIsThemeOpen(false)}
            className="absolute top-4 right-4 text-white text-2xl"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
