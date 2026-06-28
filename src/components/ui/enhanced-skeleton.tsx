
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'default' | 'article' | 'card' | 'text' | 'avatar' | 'button';
  animation?: 'pulse' | 'wave' | 'shimmer';
  lines?: number;
}

function EnhancedSkeleton({
  className,
  variant = 'default',
  animation = 'shimmer',
  lines = 1,
}: EnhancedSkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'article':
        return 'h-32 w-full rounded-lg';
      case 'card':
        return 'h-24 w-full rounded-md';
      case 'text':
        return 'h-4 w-full rounded';
      case 'avatar':
        return 'h-10 w-10 rounded-full';
      case 'button':
        return 'h-10 w-24 rounded-md';
      default:
        return 'h-4 w-full rounded';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-enhanced-pulse';
      case 'wave':
        return 'animate-wave';
      case 'shimmer':
        return 'animate-shimmer-enhanced';
      default:
        return 'animate-shimmer-enhanced';
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden",
              getVariantStyles(),
              getAnimationClass(),
              i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-wave" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 relative overflow-hidden",
        getVariantStyles(),
        getAnimationClass(),
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-wave" />
    </motion.div>
  )
}

export { EnhancedSkeleton }
