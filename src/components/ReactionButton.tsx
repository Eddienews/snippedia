
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactions } from '../hooks/useReactions';


interface ReactionButtonProps {
  articleId: string;
  className?: string;
}

const ReactionButton = ({ articleId, className = '' }: ReactionButtonProps) => {
  const [showReactions, setShowReactions] = useState(false);
  const { 
    socialData, 
    toggleReaction, 
    getReactionEmoji, 
    getTotalReactions,
    getUserReaction 
  } = useReactions(articleId);


  const userReaction =
  typeof getUserReaction === 'function' ? getUserReaction() : null;

const totalReactions =
  typeof getTotalReactions === 'function' ? getTotalReactions() : 0;


  return (
    <div className={`relative ${className}`}>
      <motion.button
        className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300 ${
          userReaction 
            ? 'bg-wikitok-red/20 text-wikitok-red border border-wikitok-red/30' 
            : 'bg-black/20 text-white/80 hover:bg-black/40 border border-white/10'
        }`}
        onClick={() => setShowReactions(!showReactions)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {userReaction ? (
          <span className="text-lg">{getReactionEmoji(userReaction)}</span>
        ) : (
          <Heart className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{totalReactions}</span>
      </motion.button>

      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-2 left-0 bg-black/90 backdrop-blur-sm rounded-full px-3 py-2 flex space-x-2 border border-white/20"
          >
            {Object.entries(socialData?.reactions ?? {}).map(([type, reaction]) => (

              <motion.button
                key={type}
                className={`text-2xl hover:scale-125 transition-transform duration-200 ${
                  reaction.userReacted ? 'scale-125' : ''
                }`}
                onClick={() => {
                  toggleReaction(type as 'like' | 'love' | 'wow' | 'sad' | 'angry');
                  setShowReactions(false);
                }}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 1.1 }}
              >
                {getReactionEmoji(type as 'like' | 'love' | 'wow' | 'sad' | 'angry')}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReactionButton;
