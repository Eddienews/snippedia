import { motion } from "framer-motion";
import { useReadingStats } from "@/hooks/useReadingStats";
import { useArticleHistory } from "@/hooks/useArticleHistory";
import { useFavorites } from "@/hooks/useFavorites";
import StatsGrid from "@/components/StatsGrid";
import { LazyReadingChart, LazyCategoryChart, LazyAnalyticsDashboardWrapper } from "@/components/LazyCharts";
import ReadingGoals from "@/components/ReadingGoals";
import RecommendedArticles from "@/components/RecommendedArticles";
import RecentActivity from "@/components/RecentActivity";
import PeriodComparison from "@/components/PeriodComparison";
import CustomGoals from "@/components/CustomGoals";
import AchievementNotifications from "@/components/AchievementNotifications";
import AutoInsights from "@/components/AutoInsights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  BarChart3, 
  Calendar, 
  Lightbulb 
} from "lucide-react";

const Dashboard = () => {
  const { stats, formatTime } = useReadingStats();
  const { history } = useArticleHistory();
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-black text-white pt-14">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-wikitok-red to-pink-500 bg-clip-text text-transparent">
            Snippedia.org Dashboard
          </h1>
          <p className="text-white/60">
            Track your progress and discover insights about your reading habits
          </p>
        </motion.div>

        {/* Achievement Notifications */}
        <AchievementNotifications />

        {/* Stats Overview */}
        <StatsGrid stats={stats} formatTime={formatTime} />

        {/* Main Content */}
        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-7 bg-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-wikitok-red">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-wikitok-red">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="comparison" className="data-[state=active]:bg-wikitok-red">
              <Calendar className="w-4 h-4 mr-2" />
              Comparação
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-wikitok-red">
              <Target className="w-4 h-4 mr-2" />
              Metas
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-wikitok-red">
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-wikitok-red">
              <BookOpen className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-wikitok-red">
              <Award className="w-4 h-4 mr-2" />
              Conquistas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LazyReadingChart history={history} />
              <LazyCategoryChart stats={stats} />
            </div>
            <RecommendedArticles favorites={favorites} history={history} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <LazyAnalyticsDashboardWrapper />
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <PeriodComparison />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <div className="space-y-8">
              <ReadingGoals stats={stats} />
              <CustomGoals />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <AutoInsights />
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <RecentActivity history={history} />
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <AchievementNotifications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
