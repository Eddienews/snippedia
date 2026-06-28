
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ReadingStats } from "@/hooks/useReadingStats";
import { Target, Edit, Save, X } from "lucide-react";

interface ReadingGoalsProps {
  stats: ReadingStats;
}

const ReadingGoals = ({ stats }: ReadingGoalsProps) => {
  const [goals, setGoals] = useState({
    dailyArticles: 3,
    weeklyArticles: 15,
    monthlyArticles: 60,
    weeklyMinutes: 120
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const handleEdit = (goalType: string, currentValue: number) => {
    setEditing(goalType);
    setTempValue(currentValue.toString());
  };

  const handleSave = (goalType: string) => {
    const newValue = parseInt(tempValue);
    if (!isNaN(newValue) && newValue > 0) {
      setGoals(prev => ({ ...prev, [goalType]: newValue }));
      localStorage.setItem('reading-goals', JSON.stringify({ ...goals, [goalType]: newValue }));
    }
    setEditing(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setTempValue("");
  };

  // Calculate progress
  const today = new Date();
  const dailyProgress = Math.min((stats.articlesThisWeek / 7) / goals.dailyArticles * 100, 100);
  const weeklyProgress = Math.min(stats.articlesThisWeek / goals.weeklyArticles * 100, 100);
  const monthlyProgress = Math.min(stats.articlesThisMonth / goals.monthlyArticles * 100, 100);
  const weeklyTimeProgress = Math.min((stats.totalTimeSpent / 60000 / 7) / goals.weeklyMinutes * 100, 100);

  const goalCards = [
    {
      title: "Daily Goal",
      current: Math.round(stats.articlesThisWeek / 7),
      target: goals.dailyArticles,
      progress: dailyProgress,
      key: "dailyArticles",
      unit: "articles/day"
    },
    {
      title: "Weekly Goal",
      current: stats.articlesThisWeek,
      target: goals.weeklyArticles,
      progress: weeklyProgress,
      key: "weeklyArticles",
      unit: "articles/week"
    },
    {
      title: "Monthly Goal",
      current: stats.articlesThisMonth,
      target: goals.monthlyArticles,
      progress: monthlyProgress,
      key: "monthlyArticles",
      unit: "articles/month"
    },
    {
      title: "Weekly Time",
      current: Math.round(stats.totalTimeSpent / 60000 / 7),
      target: goals.weeklyMinutes,
      progress: weeklyTimeProgress,
      key: "weeklyMinutes",
      unit: "min/week"
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white mb-2">Your Reading Goals</h2>
        <p className="text-white/60">Set and track your reading objectives</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goalCards.map((goal, index) => (
          <motion.div
            key={goal.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-wikitok-red" />
                    {goal.title}
                  </div>
                  {editing === goal.key ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-20 h-8 text-sm"
                        type="number"
                        min="1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSave(goal.key)}
                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCancel}
                        className="h-8 w-8 p-0 bg-gray-600 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleEdit(goal.key, goal.target)}
                      className="h-8 w-8 p-0 bg-white/10 hover:bg-white/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {goal.current}<span className="text-white/60">/{goal.target}</span>
                  </div>
                  <div className="text-sm text-white/60">{goal.unit}</div>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <div className="text-center text-sm text-white/60">
                  {goal.progress.toFixed(1)}% of goal
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReadingGoals;
