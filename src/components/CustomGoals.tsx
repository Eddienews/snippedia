
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Edit, Trash2, Trophy, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReadingStats } from '@/hooks/useReadingStats';

interface CustomGoal {
  id: string;
  title: string;
  description: string;
  type: 'articles' | 'time' | 'streak' | 'categories';
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  deadline?: string;
  isActive: boolean;
  createdAt: string;
  completedAt?: string;
}

const CustomGoals = () => {
  const [goals, setGoals] = useState<CustomGoal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const { stats } = useReadingStats();
  const { toast } = useToast();

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'articles' as const,
    target: 10,
    period: 'weekly' as const,
    deadline: ''
  });

  useEffect(() => {
    const savedGoals = localStorage.getItem('snippedia-custom-goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const saveGoals = (updatedGoals: CustomGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('snippedia-custom-goals', JSON.stringify(updatedGoals));
  };

  const calculateCurrentProgress = (goal: CustomGoal): number => {
    const now = new Date();
    let periodStart: Date;

    switch (goal.period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const weekStart = now.getDate() - now.getDay();
        periodStart = new Date(now.getFullYear(), now.getMonth(), weekStart);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Simulate progress based on current stats
    switch (goal.type) {
      case 'articles':
        if (goal.period === 'weekly') return stats.articlesThisWeek;
        if (goal.period === 'monthly') return stats.articlesThisMonth;
        return Math.floor(Math.random() * goal.target);
      case 'time':
        return Math.floor(stats.totalTimeSpent / 60000); // Convert to minutes
      case 'streak':
        return stats.streak;
      case 'categories':
        return stats.favoriteCategories.length;
      default:
        return 0;
    }
  };

  const createGoal = () => {
    if (!newGoal.title.trim()) {
      toast({
        title: "Erro",
        description: "Título da meta é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const goal: CustomGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      type: newGoal.type,
      target: newGoal.target,
      current: 0,
      period: newGoal.period,
      deadline: newGoal.deadline || undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    setIsCreating(false);
    setNewGoal({
      title: '',
      description: '',
      type: 'articles',
      target: 10,
      period: 'weekly',
      deadline: ''
    });

    toast({
      title: "Meta criada!",
      description: `Meta "${goal.title}" foi criada com sucesso.`
    });
  };

  const toggleGoal = (goalId: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
    toast({
      title: "Meta removida",
      description: "Meta foi removida com sucesso."
    });
  };

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'articles': return '📚';
      case 'time': return '⏱️';
      case 'streak': return '🔥';
      case 'categories': return '🎯';
      default: return '📊';
    }
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'articles': return 'Artigos';
      case 'time': return 'Tempo (min)';
      case 'streak': return 'Sequência';
      case 'categories': return 'Categorias';
      default: return type;
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return period;
    }
  };

  // Update current progress for all goals
  const goalsWithProgress = goals.map(goal => ({
    ...goal,
    current: calculateCurrentProgress(goal)
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-wikitok-red" />
            Metas Personalizadas
          </h2>
          <p className="text-white/60">Crie e acompanhe suas metas de leitura</p>
        </div>
        
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-wikitok-red hover:bg-wikitok-red/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Create Goal Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Criar Nova Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white text-sm font-medium">Título *</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Ex: Ler 5 artigos por semana"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium">Tipo</label>
                  <Select value={newGoal.type} onValueChange={(value: any) => setNewGoal({ ...newGoal, type: value })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="articles">Artigos</SelectItem>
                      <SelectItem value="time">Tempo (minutos)</SelectItem>
                      <SelectItem value="streak">Sequência (dias)</SelectItem>
                      <SelectItem value="categories">Categorias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium">Meta</label>
                  <Input
                    type="number"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-white text-sm font-medium">Período</label>
                  <Select value={newGoal.period} onValueChange={(value: any) => setNewGoal({ ...newGoal, period: value })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-white text-sm font-medium">Descrição</label>
                <Input
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Descrição opcional da meta"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={createGoal} className="bg-wikitok-red hover:bg-wikitok-red/80">
                  Criar Meta
                </Button>
                <Button 
                  onClick={() => setIsCreating(false)} 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goalsWithProgress.map((goal, index) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const isCompleted = goal.current >= goal.target;
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 ${isCompleted ? 'ring-2 ring-green-500/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getGoalIcon(goal.type)}</span>
                        <div>
                          <h3 className="text-white font-medium">{goal.title}</h3>
                          {goal.description && (
                            <p className="text-white/60 text-sm">{goal.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isCompleted && <Trophy className="w-4 h-4 text-yellow-400" />}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteGoal(goal.id)}
                          className="h-8 w-8 p-0 border-white/20 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/80">
                          {goal.current} / {goal.target} {getGoalTypeLabel(goal.type)}
                        </span>
                        <span className="text-white/60">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-white/70 border-white/30">
                        <Calendar className="w-3 h-3 mr-1" />
                        {getPeriodLabel(goal.period)}
                      </Badge>
                      
                      {isCompleted && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                          <Trophy className="w-3 h-3 mr-1" />
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {goalsWithProgress.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Nenhuma meta criada</h3>
            <p className="text-white/60 mb-4">
              Crie sua primeira meta personalizada para acompanhar seu progresso de leitura.
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-wikitok-red hover:bg-wikitok-red/80"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomGoals;
