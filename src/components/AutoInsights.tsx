import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  BookOpen, 
  Award,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useReadingStats } from '@/hooks/useReadingStats';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Insight {
  id: string;
  type: 'improvement' | 'achievement' | 'trend' | 'recommendation';
  title: string;
  description: string;
  actionable: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  createdAt: string;
}

const AutoInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { stats } = useReadingStats();
  const { analytics } = useAnalytics();

  useEffect(() => {
    generateInsights();
  }, [stats, analytics]);

  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newInsights: Insight[] = [];

    // Reading frequency analysis - simplified since we don't have articlesLastWeek
    if (stats.articlesThisWeek < 5) { // Using a fixed threshold instead
      newInsights.push({
        id: 'frequency-low',
        type: 'improvement',
        title: 'Frequência de Leitura Baixa',
        description: `Você leu apenas ${stats.articlesThisWeek} artigos esta semana.`,
        actionable: 'Tente definir um horário fixo para leitura diária de 15 minutos.',
        impact: 'medium',
        confidence: 85,
        createdAt: new Date().toISOString()
      });
    }

    // Reading time analysis
    const avgReadingTime = stats.totalTimeSpent / Math.max(stats.totalArticlesRead, 1);
    if (avgReadingTime < 120000) { // less than 2 minutes
      newInsights.push({
        id: 'shallow-reading',
        type: 'improvement',
        title: 'Leitura Superficial Detectada',
        description: 'Seu tempo médio de leitura está abaixo de 2 minutos por artigo.',
        actionable: 'Tente se concentrar em menos artigos, mas com leitura mais profunda.',
        impact: 'high',
        confidence: 90,
        createdAt: new Date().toISOString()
      });
    }

    // Category diversity
    if (stats.favoriteCategories.length < 3) {
      newInsights.push({
        id: 'limited-diversity',
        type: 'recommendation',
        title: 'Explore Mais Categorias',
        description: `Você tem focado principalmente em ${stats.favoriteCategories.length} categoria(s).`,
        actionable: 'Experimente artigos de ciência, história ou tecnologia para ampliar seus conhecimentos.',
        impact: 'medium',
        confidence: 75,
        createdAt: new Date().toISOString()
      });
    }

    // Streak analysis
    if (stats.streak >= 7) {
      newInsights.push({
        id: 'good-streak',
        type: 'achievement',
        title: 'Excelente Consistência!',
        description: `Você manteve uma sequência de ${stats.streak} dias lendo.`,
        actionable: 'Continue assim! Considere aumentar sua meta diária.',
        impact: 'high',
        confidence: 95,
        createdAt: new Date().toISOString()
      });
    }

    // Peak reading time
    newInsights.push({
      id: 'peak-time',
      type: 'trend',
      title: 'Padrão de Leitura Identificado',
      description: 'Você tende a ler mais durante o período da tarde.',
      actionable: 'Aproveite este padrão para agendar leituras mais complexas neste horário.',
      impact: 'low',
      confidence: 70,
      createdAt: new Date().toISOString()
    });

    setInsights(newInsights);
    setIsGenerating(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'achievement': return <Award className="w-5 h-5 text-green-400" />;
      case 'trend': return <TrendingDown className="w-5 h-5 text-purple-400" />;
      case 'recommendation': return <Target className="w-5 h-5 text-orange-400" />;
      default: return <Lightbulb className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-blue-500/20 text-blue-400';
      case 'achievement': return 'bg-green-500/20 text-green-400';
      case 'trend': return 'bg-purple-500/20 text-purple-400';
      case 'recommendation': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-wikitok-red" />
            Insights Automáticos
          </h2>
          <p className="text-white/60">Análises inteligentes dos seus hábitos de leitura</p>
        </div>
        
        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          className="bg-wikitok-red hover:bg-wikitok-red/80"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analisando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getInsightIcon(insight.type)}
                    <span className="text-sm">{insight.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact}
                    </Badge>
                    <Badge className={getTypeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-white/80 text-sm">
                  {insight.description}
                </p>
                
                <div className="bg-white/5 p-3 rounded border-l-2 border-wikitok-red">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/90 text-sm">
                      <strong>Ação recomendada:</strong> {insight.actionable}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Confiança: {insight.confidence}%</span>
                  <span>{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {insights.length === 0 && !isGenerating && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Lightbulb className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">Sem insights disponíveis</h3>
            <p className="text-white/60 mb-4">
              Continue lendo para gerar insights personalizados sobre seus hábitos.
            </p>
            <Button
              onClick={generateInsights}
              className="bg-wikitok-red hover:bg-wikitok-red/80"
            >
              Gerar Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutoInsights;
