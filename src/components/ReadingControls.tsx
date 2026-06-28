
import { Type, Eye, EyeOff, Clock, Image } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useReadingSettings } from '../hooks/useReadingSettings';
import { motion, AnimatePresence } from 'framer-motion';
import NightModeControls from './NightModeControls';
import { useState } from 'react';

interface ReadingControlsProps {
  article?: {
    content: string;
    readTime: number;
  };
  className?: string;
}

const ReadingControls = ({ article, className = '' }: ReadingControlsProps) => {
  const { settings, update } = useReadingSettings();

  const [showNightMode, setShowNightMode] = useState(false);

  const readingTime = article?.content
    ? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))
    : article?.readTime || 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 backdrop-blur-sm rounded-lg p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Reading Settings</h3>
          {readingTime > 0 && (
            <span className="text-white/70 text-xs">
              {readingTime} min read
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Focus Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => update({ focusMode: !settings.focusMode })}
            className={`flex items-center space-x-2 border-white/20 text-white hover:bg-white/20 ${
              settings.focusMode ? 'bg-wikitok-red/50' : 'bg-white/10'
            }`}
          >
            {settings.focusMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-xs">Normal</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-xs">Focus</span>
              </>
            )}
          </Button>

          {/* Images Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => update({ showImages: !settings.showImages })}
            className={`flex items-center space-x-2 border-white/20 text-white hover:bg-white/20 ${
              settings.showImages ? 'bg-white/10' : 'bg-slate-500/30'
            }`}
          >
            {settings.showImages ? (
              <>
                <Image className="w-4 h-4" />
                <span className="text-xs">Images On</span>
              </>
            ) : (
              <>
                <Image className="w-4 h-4" />
                <span className="text-xs">Images Off</span>
              </>
            )}
          </Button>
        </div>

        {/* Font Size Selector */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/70">
            <Type className="w-4 h-4" />
            <span className="text-xs">Font Size</span>
          </div>
          <Select value={String(settings.fontSize)} onValueChange={(value) => update({ fontSize: Number(value) })}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="16" className="text-white hover:bg-white/10">
                Small (16px)
              </SelectItem>
              <SelectItem value="18" className="text-white hover:bg-white/10">
                Medium (18px)
              </SelectItem>
              <SelectItem value="20" className="text-white hover:bg-white/10">
                Large (20px)
              </SelectItem>
              <SelectItem value="24" className="text-white hover:bg-white/10">
                Extra Large (24px)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Night Mode Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNightMode(!showNightMode)}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-500/20 border-indigo-400/30 text-white hover:bg-indigo-500/30"
        >
          <Clock className="w-4 h-4" />
          <span className="text-xs">Night Reading Mode</span>
        </Button>
      </motion.div>

      {/* Night Mode Controls */}
      <AnimatePresence>
        {showNightMode && (
          <NightModeControls />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReadingControls;
