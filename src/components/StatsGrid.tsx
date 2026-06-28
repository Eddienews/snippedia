
import { motion } from "framer-motion";
import { BookOpen, Clock, Flame, TrendingUp, Target } from "lucide-react";
import StatsCard from "./StatsCard";
import { ReadingStats } from "@/hooks/useReadingStats";

interface StatsGridProps {
  stats: ReadingStats;
  formatTime: (milliseconds: number) => string;
}

const StatsGrid = ({ stats, formatTime }: StatsGridProps) => {
  return (
    <div className="px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Articles Read"
          value={stats.totalArticlesRead}
          icon={BookOpen}
          color="bg-blue-500"
          delay={0}
        />
        <StatsCard
          title="Total Time"
          value={formatTime(stats.totalTimeSpent)}
          icon={Clock}
          color="bg-green-500"
          delay={0.1}
        />
        <StatsCard
          title="Streak"
          value={`${stats.streak} days`}
          subtitle="consecutive"
          icon={Flame}
          color="bg-orange-500"
          delay={0.2}
        />
        <StatsCard
          title="This Week"
          value={stats.articlesThisWeek}
          subtitle="articles"
          icon={TrendingUp}
          color="bg-purple-500"
          delay={0.3}
        />
      </div>

      {/* Favorite Categories */}
      {stats.favoriteCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Target className="w-5 h-5 mr-2 text-wikitok-red" />
            Favorite Categories
          </h3>
          <div className="space-y-2">
            {stats.favoriteCategories.slice(0, 3).map((cat, index) => (
              <div key={cat.category} className="flex items-center justify-between">
                <span className="text-white/80">{cat.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-wikitok-red rounded-full transition-all duration-500"
                      style={{ width: `${(cat.count / stats.totalArticlesRead) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-white/60">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StatsGrid;
