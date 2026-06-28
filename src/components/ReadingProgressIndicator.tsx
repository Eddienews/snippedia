
import { motion } from 'framer-motion';
import { Clock, BookOpen, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ReadingProgressIndicatorProps {
  progress: number;
  estimatedTime: number;
  currentWords: number;
  totalWords: number;
  readingSpeed?: number; // words per minute
  className?: string;
}

const ReadingProgressIndicator = ({
  progress,
  estimatedTime,
  currentWords,
  totalWords,
  readingSpeed = 200,
  className = ''
}: ReadingProgressIndicatorProps) => {
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);

  useEffect(() => {
    const remaining = Math.max(0, Math.ceil((totalWords - currentWords) / readingSpeed * 60));
    setTimeRemaining(remaining);
  }, [currentWords, totalWords, readingSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/80 backdrop-blur-sm rounded-lg p-3 ${className}`}
    >
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-3">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-wikitok-red to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs text-white/80">
        <div className="flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span>{Math.round(progress)}%</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <BookOpen className="w-3 h-3" />
          <span>{currentWords.toLocaleString()}/{totalWords.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatTime(timeRemaining)} left</span>
        </div>
      </div>

      {/* Mini Progress Dots */}
      <div className="flex justify-center mt-2 space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className={`w-1.5 h-1.5 rounded-full ${
              (progress / 20) > i ? 'bg-wikitok-red' : 'bg-gray-600'
            }`}
            animate={{
              scale: (progress / 20) > i ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 0.3,
              delay: i * 0.1,
              repeat: (progress / 20) > i ? Infinity : 0,
              repeatDelay: 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ReadingProgressIndicator;
