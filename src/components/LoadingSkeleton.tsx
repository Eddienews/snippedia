
import { cn } from '@/lib/utils';
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'avatar' | 'article' | 'search' | 'sidebar';
  count?: number;
}

const LoadingSkeleton = ({ className, variant = 'card', count = 1 }: LoadingSkeletonProps) => {
  const getSkeletonContent = () => {
    switch (variant) {
      case 'card':
        return (
          <motion.div 
            className="aspect-[9/16] rounded-xl relative overflow-hidden card-enhanced"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <EnhancedSkeleton className="absolute inset-0" animation="shimmer" />
            <div className="absolute bottom-4 left-4 right-4 space-y-3">
              <EnhancedSkeleton variant="text" className="h-4 bg-gray-600/80" />
              <EnhancedSkeleton variant="text" className="h-3 w-2/3 bg-gray-600/60" />
              <div className="flex justify-between">
                <EnhancedSkeleton className="h-2 w-16 bg-gray-600/40" />
                <EnhancedSkeleton className="h-2 w-12 bg-gray-600/40" />
              </div>
            </div>
          </motion.div>
        );
      
      case 'text':
        return (
          <EnhancedSkeleton variant="text" lines={3} animation="wave" />
        );
      
      case 'avatar':
        return (
          <EnhancedSkeleton variant="avatar" className="animate-enhanced-pulse" />
        );

      case 'search':
        return (
          <motion.div 
            className="flex items-center p-3 space-x-3 card-enhanced"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <EnhancedSkeleton className="w-16 h-16 rounded-md" animation="shimmer" />
            <div className="flex-1 space-y-2">
              <EnhancedSkeleton variant="text" className="h-4 w-3/4" />
              <EnhancedSkeleton variant="text" className="h-3 w-1/2" />
              <div className="flex space-x-1">
                <EnhancedSkeleton className="h-2 w-12" />
                <EnhancedSkeleton className="h-2 w-12" />
                <EnhancedSkeleton className="h-2 w-12" />
              </div>
            </div>
          </motion.div>
        );

      case 'sidebar':
        return (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            <motion.div className="space-y-2">
              <EnhancedSkeleton className="h-3 w-16" />
              <div className="space-y-1">
                <EnhancedSkeleton variant="button" className="h-6 w-20 rounded-full" />
                <EnhancedSkeleton variant="button" className="h-6 w-24 rounded-full" />
                <EnhancedSkeleton variant="button" className="h-6 w-18 rounded-full" />
              </div>
            </motion.div>
            <motion.div className="space-y-2">
              <EnhancedSkeleton className="h-3 w-20" />
              <div className="flex space-x-2">
                <EnhancedSkeleton variant="avatar" className="w-8 h-8" />
                <EnhancedSkeleton variant="avatar" className="w-8 h-8" />
                <EnhancedSkeleton variant="avatar" className="w-8 h-8" />
              </div>
            </motion.div>
          </motion.div>
        );
      
      case 'article':
        return (
          <motion.div 
            className="space-y-6 p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedSkeleton className="h-8 w-3/4" animation="wave" />
            <EnhancedSkeleton variant="text" lines={5} animation="shimmer" />
            <div className="flex items-center space-x-4">
              <EnhancedSkeleton className="h-3 w-16" />
              <EnhancedSkeleton className="h-3 w-20" />
            </div>
          </motion.div>
        );
      
      default:
        return <EnhancedSkeleton className="h-4 w-full" />;
    }
  };

  return (
    <div className={cn("", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i} 
          className={count > 1 ? "mb-4" : ""}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          {getSkeletonContent()}
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
