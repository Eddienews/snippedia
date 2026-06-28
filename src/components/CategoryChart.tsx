
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { ReadingStats } from "@/hooks/useReadingStats";
import { Layers } from "lucide-react";

interface CategoryChartProps {
  stats: ReadingStats;
}

const CategoryChart = ({ stats }: CategoryChartProps) => {
  const colors = [
    "#dc2626", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#ec4899"
  ];

  const chartData = stats.favoriteCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.count,
    percentage: ((cat.count / stats.favoriteCategories.reduce((sum, c) => sum + c.count, 0)) * 100).toFixed(1),
    color: colors[index % colors.length]
  }));

  const chartConfig = chartData.reduce((config, item) => {
    config[item.name] = {
      label: item.name,
      color: item.color,
    };
    return config;
  }, {} as any);

  // Custom tooltip with enhanced information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl"
        >
          <div className="flex items-center mb-2">
            <div 
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="text-white font-medium">{data.name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-300">Articles read: <span className="text-white font-medium">{data.value}</span></p>
            <p className="text-gray-300">Percentage: <span className="text-white font-medium">{data.payload.percentage}%</span></p>
            <p className="text-gray-300 text-xs">
              {data.value === 1 ? "1 article" : `${data.value} articles`} in this category
            </p>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom label with animations
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Layers className="w-5 h-5 mr-2 text-wikitok-red" />
            </motion.div>
            Favorite Categories
          </CardTitle>
          <p className="text-white/60 text-sm">Distribution of your reading interests</p>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={400}
                    animationDuration={1000}
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Category legend with stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {chartData.slice(0, 6).map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="flex items-center text-sm"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-white/80 truncate">{category.name}</span>
                    <span className="text-white/60 ml-auto">{category.percentage}%</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[300px] flex flex-col items-center justify-center text-white/60"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Layers className="w-12 h-12 mb-4 text-white/30" />
              </motion.div>
              <p className="text-center">Read more articles to see your favorite categories</p>
              <p className="text-sm text-white/40 mt-2">Start exploring to build your reading profile!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryChart;
