
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface PeriodData {
  articlesRead: number;
  timeSpent: number;
  averageTime: number;
  categories: string[];
  streak: number;
}

const PeriodComparison = () => {
  const { analytics, formatTime } = useAnalytics();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [comparisonType, setComparisonType] = useState<string>('previous');

  const getPeriodData = (daysBack: number): PeriodData => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    const periodSessions = analytics.readingSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });

    const articlesRead = periodSessions.length;
    const timeSpent = periodSessions.reduce((acc, session) => acc + session.timeSpent, 0);
    const averageTime = articlesRead > 0 ? timeSpent / articlesRead : 0;
    const categories = [...new Set(periodSessions.map(s => s.category))];

    return {
      articlesRead,
      timeSpent,
      averageTime,
      categories,
      streak: analytics.streakData.currentStreak
    };
  };

  const getCurrentPeriod = (): PeriodData => {
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    return getPeriodData(days);
  };

  const getPreviousPeriod = (): PeriodData => {
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90;
    const endDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const periodSessions = analytics.readingSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    });

    const articlesRead = periodSessions.length;
    const timeSpent = periodSessions.reduce((acc, session) => acc + session.timeSpent, 0);
    const averageTime = articlesRead > 0 ? timeSpent / articlesRead : 0;
    const categories = [...new Set(periodSessions.map(s => s.category))];

    return {
      articlesRead,
      timeSpent,
      averageTime,
      categories,
      streak: 0 // Previous period streak calculation would be complex
    };
  };

  const currentData = getCurrentPeriod();
  const previousData = getPreviousPeriod();

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const metrics = [
    {
      label: 'Artigos Lidos',
      current: currentData.articlesRead,
      previous: previousData.articlesRead,
      format: (value: number) => value.toString()
    },
    {
      label: 'Tempo Total',
      current: currentData.timeSpent,
      previous: previousData.timeSpent,
      format: (value: number) => formatTime(value)
    },
    {
      label: 'Tempo Médio',
      current: currentData.averageTime,
      previous: previousData.averageTime,
      format: (value: number) => formatTime(value)
    },
    {
      label: 'Categorias Exploradas',
      current: currentData.categories.length,
      previous: previousData.categories.length,
      format: (value: number) => value.toString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-wikitok-red" />
            Comparação de Períodos
          </h2>
          <p className="text-white/60">Compare seu progresso entre diferentes períodos</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <p className="text-sm text-white/60">{metric.label}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {metric.format(metric.current)}
                        </p>
                        <p className="text-xs text-white/40">
                          Anterior: {metric.format(metric.previous)}
                        </p>
                      </div>
                      <div className={`flex items-center space-x-1 ${getChangeColor(change)}`}>
                        {getChangeIcon(change)}
                        <span className="text-sm font-medium">
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Period Summary */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Resumo do Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">Período Atual</h4>
              <div className="space-y-2">
                <p className="text-white/70">
                  📚 {currentData.articlesRead} artigos lidos
                </p>
                <p className="text-white/70">
                  ⏱️ {formatTime(currentData.timeSpent)} de leitura
                </p>
                <p className="text-white/70">
                  🎯 {currentData.categories.length} categorias exploradas
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Período Anterior</h4>
              <div className="space-y-2">
                <p className="text-white/70">
                  📚 {previousData.articlesRead} artigos lidos
                </p>
                <p className="text-white/70">
                  ⏱️ {formatTime(previousData.timeSpent)} de leitura
                </p>
                <p className="text-white/70">
                  🎯 {previousData.categories.length} categorias exploradas
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodComparison;
