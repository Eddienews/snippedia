
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Target, Flame, BookOpen, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReadingStats } from '@/hooks/useReadingStats';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'time' | 'category' | 'special';
  requirement: number;
  progress: number;
  earned: boolean;
  earnedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Notification {
  id: string;
  achievement: Achievement;
  timestamp: number;
  shown: boolean;
}

const AchievementNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const { stats } = useReadingStats();
  const { toast } = useToast();

  const defaultAchievements: Achievement[] = [
    {
      id: 'first_article',
      title: 'Primeiro Passo',
      description: 'Leu seu primeiro artigo',
      icon: '🎯',
      type: 'milestone',
      requirement: 1,
      progress: 0,
      earned: false,
      rarity: 'common'
    },
    {
      id: 'bookworm',
      title: 'Bookworm',
      description: 'Leu 10 artigos',
      icon: '📚',
      type: 'milestone',
      requirement: 10,
      progress: 0,
      earned: false,
      rarity: 'common'
    },
    {
      id: 'scholar',
      title: 'Estudioso',
      description: 'Leu 50 artigos',
      icon: '🎓',
      type: 'milestone',
      requirement: 50,
      progress: 0,
      earned: false,
      rarity: 'rare'
    },
    {
      id: 'master_reader',
      title: 'Mestre da Leitura',
      description: 'Leu 100 artigos',
      icon: '👑',
      type: 'milestone',
      requirement: 100,
      progress: 0,
      earned: false,
      rarity: 'epic'
    },
    {
      id: 'streak_3',
      title: 'Consistente',
      description: 'Manteve uma sequência de 3 dias',
      icon: '🔥',
      type: 'streak',
      requirement: 3,
      progress: 0,
      earned: false,
      rarity: 'common'
    },
    {
      id: 'streak_7',
      title: 'Dedicado',
      description: 'Manteve uma sequência de 7 dias',
      icon: '⚡',
      type: 'streak',
      requirement: 7,
      progress: 0,
      earned: false,
      rarity: 'rare'
    },
    {
      id: 'streak_30',
      title: 'Imparável',
      description: 'Manteve uma sequência de 30 dias',
      icon: '💎',
      type: 'streak',
      requirement: 30,
      progress: 0,
      earned: false,
      rarity: 'legendary'
    },
    {
      id: 'time_1h',
      title: 'Hora de Sabedoria',
      description: 'Passou 1 hora lendo',
      icon: '⏰',
      type: 'time',
      requirement: 60, // minutes
      progress: 0,
      earned: false,
      rarity: 'common'
    },
    {
      id: 'time_10h',
      title: 'Maratonista',
      description: 'Passou 10 horas lendo',
      icon: '🏃',
      type: 'time',
      requirement: 600, // minutes
      progress: 0,
      earned: false,
      rarity: 'epic'
    },
    {
      id: 'explorer',
      title: 'Explorador',
      description: 'Leu artigos de 5 categorias diferentes',
      icon: '🗺️',
      type: 'category',
      requirement: 5,
      progress: 0,
      earned: false,
      rarity: 'rare'
    }
  ];

  useEffect(() => {
    const savedAchievements = localStorage.getItem('snippedia-achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    } else {
      setAchievements(defaultAchievements);
    }

    const savedNotifications = localStorage.getItem('snippedia-notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  useEffect(() => {
    if (achievements.length === 0) return;

    const updatedAchievements = achievements.map(achievement => {
      let currentProgress = 0;

      switch (achievement.type) {
        case 'milestone':
          currentProgress = stats.totalArticlesRead;
          break;
        case 'streak':
          currentProgress = stats.streak;
          break;
        case 'time':
          currentProgress = Math.floor(stats.totalTimeSpent / 60000); // Convert to minutes
          break;
        case 'category':
          currentProgress = stats.favoriteCategories.length;
          break;
      }

      const wasEarned = achievement.earned;
      const isNowEarned = currentProgress >= achievement.requirement;

      if (!wasEarned && isNowEarned) {
        // Achievement just earned!
        const notification: Notification = {
          id: Date.now().toString() + achievement.id,
          achievement: { ...achievement, earned: true, earnedAt: new Date().toISOString() },
          timestamp: Date.now(),
          shown: false
        };

        setNotifications(prev => {
          const updated = [...prev, notification];
          localStorage.setItem('snippedia-notifications', JSON.stringify(updated));
          return updated;
        });

        // Show toast notification
        toast({
          title: "🏆 Conquista Desbloqueada!",
          description: `${achievement.icon} ${achievement.title}`,
          duration: 5000,
        });
      }

      return {
        ...achievement,
        progress: currentProgress,
        earned: isNowEarned,
        earnedAt: isNowEarned && !wasEarned ? new Date().toISOString() : achievement.earnedAt
      };
    });

    setAchievements(updatedAchievements);
    localStorage.setItem('snippedia-achievements', JSON.stringify(updatedAchievements));
  }, [stats, achievements.length]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Comum';
      case 'rare': return 'Raro';
      case 'epic': return 'Épico';
      case 'legendary': return 'Lendário';
      default: return rarity;
    }
  };

  const dismissNotification = (notificationId: string) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    setNotifications(updatedNotifications);
    localStorage.setItem('snippedia-notifications', JSON.stringify(updatedNotifications));
  };

  const unshownNotifications = notifications.filter(n => !n.shown);

  return (
    <div className="space-y-6">
      {/* Recent Notifications */}
      <AnimatePresence>
        {unshownNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-20 right-4 z-50"
          >
            <Card className="bg-gradient-to-r from-wikitok-red/20 to-purple-600/20 border-wikitok-red/50 shadow-2xl backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{notification.achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-bold">Conquista Desbloqueada!</span>
                    </div>
                    <h3 className="text-white font-medium">{notification.achievement.title}</h3>
                    <p className="text-white/70 text-sm">{notification.achievement.description}</p>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 ${getRarityColor(notification.achievement.rarity)}`}
                    >
                      {getRarityLabel(notification.achievement.rarity)}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissNotification(notification.id)}
                    className="h-8 w-8 p-0 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center mb-4">
          <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
          Conquistas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const progressPercentage = Math.min((achievement.progress / achievement.requirement) * 100, 100);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 ${
                  achievement.earned ? 'ring-2 ring-yellow-400/50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`text-2xl ${achievement.earned ? '' : 'grayscale opacity-50'}`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <h3 className={`font-medium ${achievement.earned ? 'text-white' : 'text-white/60'}`}>
                              {achievement.title}
                            </h3>
                            <p className="text-white/60 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                        
                        {achievement.earned && (
                          <Trophy className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/70">
                            {achievement.progress} / {achievement.requirement}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`${getRarityColor(achievement.rarity)} text-xs`}
                          >
                            {getRarityLabel(achievement.rarity)}
                          </Badge>
                        </div>
                        
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-wikitok-red to-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                      
                      {achievement.earnedAt && (
                        <p className="text-white/40 text-xs">
                          Conquistado em {new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementNotifications;
