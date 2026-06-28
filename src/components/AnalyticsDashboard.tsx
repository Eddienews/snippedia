
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Clock, BookOpen, Target, TrendingUp, Calendar, Users, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrendingArticles from "./TrendingArticles";
import DateRangeFilter from "./DateRangeFilter";
import { useState } from "react";

const AnalyticsDashboard = () => {
  const { analytics, formatTime } = useAnalytics();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });

  // Filter data based on date range
  const filteredSessions = analytics.readingSessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
  });

  const readingTimeData = filteredSessions
    .reduce((acc: any[], session) => {
      const date = new Date(session.date).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.time += session.timeSpent / 60000; // Convert to minutes
        existing.sessions += 1;
      } else {
        acc.push({
          date,
          time: Math.round(session.timeSpent / 60000 * 10) / 10, // Round to 1 decimal
          sessions: 1
        });
      }
      return acc;
    }, [])
    .slice(-7); // Last 7 days

  const categoryData = analytics.categoryEngagement.map(cat => ({
    name: cat.category,
    value: Math.round(cat.totalTime / 60000 * 10) / 10, // Convert to minutes, round to 1 decimal
    articles: cat.articleCount
  }));

  const heatmapData = analytics.engagementHeatmap.map(item => ({
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item.day],
    hour: item.hour,
    engagement: item.engagement,
    articles: item.articlesRead
  }));

  const colors = ['#FF6B7A', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  const exportData = () => {
    const exportObj = {
      dateRange,
      summary: {
        totalReadingTime: analytics.readingStats.totalTimeMonth,
        articlesRead: filteredSessions.length,
        currentStreak: analytics.streakData.currentStreak,
        averageSessionTime: analytics.readingStats.averageSessionTime
      },
      readingSessions: filteredSessions,
      categoryEngagement: analytics.categoryEngagement,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportObj, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported successfully!",
      description: "Your analytics data has been downloaded.",
    });
  };

  // Custom tooltip components
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{`Date: ${label}`}</p>
          <p className="text-blue-400">{`Reading Time: ${payload[0].value} minutes`}</p>
          <p className="text-gray-300 text-sm">{`Sessions: ${payload[0].payload.sessions}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-green-400">{`Time: ${data.value} minutes`}</p>
          <p className="text-gray-300 text-sm">{`Articles: ${data.payload.articles}`}</p>
          <p className="text-gray-300 text-sm">{`${((data.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}% of total`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-white/60">Track your reading progress and habits</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangeFilter onDateRangeChange={setDateRange} />
          <Button 
            onClick={exportData}
            className="bg-wikitok-red hover:bg-wikitok-red/80 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-red-500/20 rounded-lg"
                >
                  <Clock className="w-5 h-5 text-wikitok-red" />
                </motion.div>
                <div>
                  <p className="text-sm text-white/60">Total Reading Time</p>
                  <p className="text-xl font-bold text-white">
                    {formatTime(analytics.readingStats.totalTimeMonth)}
                  </p>
                  <p className="text-xs text-white/40">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-blue-500/20 rounded-lg"
                >
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </motion.div>
                <div>
                  <p className="text-sm text-white/60">Articles Read</p>
                  <p className="text-xl font-bold text-white">
                    {filteredSessions.length}
                  </p>
                  <p className="text-xs text-white/40">In selected period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-green-500/20 rounded-lg"
                >
                  <Target className="w-5 h-5 text-green-400" />
                </motion.div>
                <div>
                  <p className="text-sm text-white/60">Current Streak</p>
                  <p className="text-xl font-bold text-white">
                    {analytics.streakData.currentStreak} days
                  </p>
                  <p className="text-xs text-white/40">Keep it up!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-purple-500/20 rounded-lg"
                >
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </motion.div>
                <div>
                  <p className="text-sm text-white/60">Peak Hour</p>
                  <p className="text-xl font-bold text-white">
                    {analytics.readingStats.peakReadingHour}:00
                  </p>
                  <p className="text-xs text-white/40">Most active time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-wikitok-red">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-wikitok-red">
            Trending
          </TabsTrigger>
          <TabsTrigger value="engagement" className="data-[state=active]:bg-wikitok-red">
            Engagement
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-wikitok-red">
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reading Time Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Daily Reading Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={readingTimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="date" stroke="#fff" fontSize={12} />
                      <YAxis stroke="#fff" fontSize={12} />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar 
                        dataKey="time" 
                        fill="#FF6B7A" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1000}
                        animationBegin={0}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Reading by Category</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        animationBegin={300}
                        animationDuration={800}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <TrendingArticles limit={15} showCategories={true} variant="full" />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Heatmap */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Reading Activity Heatmap</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-24 gap-1">
                {Array.from({ length: 7 }, (_, day) => (
                  <div key={day} className="col-span-24 grid grid-cols-24 gap-1">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const data = heatmapData.find(item => 
                        item.day === ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day] && 
                        item.hour === hour
                      );
                      const intensity = data ? Math.min(100, data.engagement / 10) : 0;
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className="w-3 h-3 rounded-sm"
                          style={{
                            backgroundColor: `rgba(255, 107, 122, ${intensity / 100})`
                          }}
                          title={`${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]} ${hour}:00 - ${data?.articles || 0} articles`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-white/60">
                <span>Low activity</span>
                <span>High activity</span>
              </div>
            </CardContent>
          </Card>

          {/* Streak Progress */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Reading Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Current Streak</span>
                  <span className="text-2xl font-bold text-wikitok-red">
                    {analytics.streakData.currentStreak} days
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Longest Streak</span>
                  <span className="text-xl font-bold text-green-400">
                    {analytics.streakData.longestStreak} days
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Weekly Progress</span>
                    <span className="text-white">
                      {analytics.streakData.weeklyProgress}/{analytics.streakData.weeklyGoal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-wikitok-red h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(analytics.streakData.weeklyProgress / analytics.streakData.weeklyGoal) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Reading Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-medium mb-2">📈 Most Active Time</h4>
                  <p className="text-white/70">
                    You read most articles around {analytics.readingStats.peakReadingHour}:00. 
                    Consider scheduling important reading during this time.
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-medium mb-2">⏱️ Average Session</h4>
                  <p className="text-white/70">
                    Your average reading session is {formatTime(analytics.readingStats.averageSessionTime)}. 
                    {analytics.readingStats.averageSessionTime > 300000 ? 
                      "Great focus!" : "Try longer reading sessions for better retention."}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-medium mb-2">🎯 Reading Consistency</h4>
                  <p className="text-white/70">
                    You read an average of {analytics.readingStats.articlesPerDay.toFixed(1)} articles per day. 
                    {analytics.readingStats.articlesPerDay >= 1 ? 
                      "Excellent consistency!" : "Try to read at least one article daily."}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white/5">
                  <h4 className="text-white font-medium mb-2">📚 Favorite Topics</h4>
                  <p className="text-white/70">
                    Your top category is {analytics.categoryEngagement[0]?.category || 'Science'}. 
                    Consider exploring related topics to broaden your knowledge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
