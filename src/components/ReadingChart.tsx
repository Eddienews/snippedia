
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ArticleHistoryItem } from "@/hooks/useArticleHistory";
import { TrendingUp } from "lucide-react";

interface ReadingChartProps {
  history: ArticleHistoryItem[];
}

const ReadingChart = ({ history }: ReadingChartProps) => {
  // Process data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const dayHistory = history.filter(item => 
      item.viewedAt.split('T')[0] === date
    );
    
    const totalTime = dayHistory.reduce((acc, item) => acc + (item.timeSpent || 0), 0) / 60000; // in minutes
    
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: date,
      articles: dayHistory.length,
      timeSpent: Math.round(totalTime * 10) / 10, // Round to 1 decimal place
      averageTime: dayHistory.length > 0 ? Math.round((totalTime / dayHistory.length) * 10) / 10 : 0
    };
  });

  const chartConfig = {
    articles: {
      label: "Articles",
      color: "#dc2626",
    },
    timeSpent: {
      label: "Time (min)",
      color: "#3b82f6",
    },
  };

  // Custom tooltip for better UX
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl"
        >
          <p className="text-white font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-red-400 flex items-center">
              <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
              Articles: {data.articles}
            </p>
            <p className="text-blue-400 flex items-center">
              <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
              Total time: {data.timeSpent} min
            </p>
            {data.articles > 0 && (
              <p className="text-green-400 text-sm">
                Avg per article: {data.averageTime} min
              </p>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <TrendingUp className="w-5 h-5 mr-2 text-wikitok-red" />
            </motion.div>
            Weekly Progress
          </CardTitle>
          <p className="text-white/60 text-sm">Your reading activity over the last 7 days</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ffffff60', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#ffffff60', fontSize: 12 }}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="articles"
                stroke="#dc2626"
                strokeWidth={3}
                fill="url(#colorArticles)"
                fillOpacity={0.6}
                animationDuration={1500}
                animationBegin={200}
              />
              <Line
                type="monotone"
                dataKey="articles"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ 
                  fill: '#dc2626', 
                  strokeWidth: 2, 
                  r: 4,
                  fillOpacity: 1
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: '#dc2626', 
                  strokeWidth: 2,
                  fill: '#fff'
                }}
                animationDuration={1500}
                animationBegin={200}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Summary stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-white/10"
          >
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {chartData.reduce((sum, day) => sum + day.articles, 0)}
              </p>
              <p className="text-xs text-white/60">Total Articles</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {Math.round(chartData.reduce((sum, day) => sum + day.timeSpent, 0))}m
              </p>
              <p className="text-xs text-white/60">Total Time</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {Math.round(chartData.reduce((sum, day) => sum + day.timeSpent, 0) / Math.max(1, chartData.reduce((sum, day) => sum + day.articles, 0)))}m
              </p>
              <p className="text-xs text-white/60">Avg per Article</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReadingChart;
