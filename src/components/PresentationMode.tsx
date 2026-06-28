
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Presentation, X, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PresentationModeProps {
  articles: any[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
}

const PresentationMode = ({ articles, currentIndex, onIndexChange, onExit }: PresentationModeProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideDuration, setSlideDuration] = useState(5000); // 5 seconds default
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlideshow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    setProgress(0);
    
    // Progress bar animation
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (slideDuration / 100));
      });
    }, 100);

    // Slide transition
    intervalRef.current = setInterval(() => {
      setProgress(0);
      onIndexChange((currentIndex + 1) % articles.length);
    }, slideDuration);
  };

  const stopSlideshow = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setProgress(0);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToNext = () => {
    setProgress(0);
    onIndexChange((currentIndex + 1) % articles.length);
  };

  const goToPrevious = () => {
    setProgress(0);
    onIndexChange(currentIndex === 0 ? articles.length - 1 : currentIndex - 1);
  };

  const changeDuration = (newDuration: string) => {
    setSlideDuration(parseInt(newDuration));
    if (isPlaying) {
      stopSlideshow();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startSlideshow();
    } else {
      stopSlideshow();
    }

    return () => {
      stopSlideshow();
    };
  }, [isPlaying, slideDuration, currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentIndex]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const currentArticle = articles[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Background Image */}
      <motion.div
        key={currentArticle?.id}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <img
          src={currentArticle?.image}
          alt={currentArticle?.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
        <motion.div
          className="h-full bg-red-500"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Article Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentArticle?.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-white text-center max-w-4xl mx-auto px-8"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentArticle?.title}
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl leading-relaxed opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {currentArticle?.content?.slice(0, 300)}...
          </motion.p>

          <motion.div
            className="mt-8 text-sm opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {currentIndex + 1} / {articles.length} • {currentArticle?.views?.toLocaleString()} views
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlayPause}
                className="text-white hover:bg-white/20 bg-red-500/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <div className="border-l border-white/20 pl-4 flex items-center space-x-2">
                <Settings className="w-4 h-4 text-white/60" />
                <Select value={slideDuration.toString()} onValueChange={changeDuration}>
                  <SelectTrigger className="bg-black/50 border-white/20 text-white w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    <SelectItem value="3000" className="text-white hover:bg-white/10">3s</SelectItem>
                    <SelectItem value="5000" className="text-white hover:bg-white/10">5s</SelectItem>
                    <SelectItem value="8000" className="text-white hover:bg-white/10">8s</SelectItem>
                    <SelectItem value="10000" className="text-white hover:bg-white/10">10s</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onExit}
                className="text-white hover:bg-white/20 border-l border-white/20 pl-4 ml-4"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {articles.slice(0, 8).map((_, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
        {articles.length > 8 && (
          <span className="text-white/60 text-xs ml-2">+{articles.length - 8}</span>
        )}
      </div>
    </div>
  );
};

export default PresentationMode;
