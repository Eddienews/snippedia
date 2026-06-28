
import { motion } from 'framer-motion';
import { Search, BookOpen, Heart, History, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  type: 'search' | 'favorites' | 'history' | 'articles' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) => {
  const getConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: title || 'Nenhum resultado encontrado',
          description: description || 'Tente ajustar sua pesquisa ou explorar outros tópicos',
          actionLabel: actionLabel || 'Explorar Artigos',
          gradient: 'from-blue-500 to-purple-600'
        };
      case 'favorites':
        return {
          icon: Heart,
          title: title || 'Nenhum favorito ainda',
          description: description || 'Comece curtindo artigos que você quer ler depois',
          actionLabel: actionLabel || 'Descobrir Artigos',
          gradient: 'from-red-500 to-pink-600'
        };
      case 'history':
        return {
          icon: History,
          title: title || 'Histórico vazio',
          description: description || 'Seus artigos lidos aparecerão aqui',
          actionLabel: actionLabel || 'Começar a Ler',
          gradient: 'from-green-500 to-teal-600'
        };
      case 'articles':
        return {
          icon: BookOpen,
          title: title || 'Nenhum artigo disponível',
          description: description || 'Não conseguimos carregar artigos no momento',
          actionLabel: actionLabel || 'Tentar Novamente',
          gradient: 'from-orange-500 to-red-600'
        };
      default:
        return {
          icon: Sparkles,
          title: title || 'Nada aqui ainda',
          description: description || 'Este espaço está esperando por conteúdo',
          actionLabel: actionLabel || 'Começar',
          gradient: 'from-purple-500 to-indigo-600'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
    >
      {/* Animated Icon Background */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className={`relative mb-6`}
      >
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${config.gradient} p-6 shadow-xl`}>
          <Icon className="w-full h-full text-white" />
        </div>
        
        {/* Floating Particles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            animate={{
              y: [-10, -20, -10],
              x: [0, (i - 1) * 10, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            style={{
              top: `${20 + i * 15}%`,
              right: `${10 + i * 10}%`,
            }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-4 max-w-md"
      >
        <h3 className="text-xl font-semibold text-white">
          {config.title}
        </h3>
        <p className="text-white/70 leading-relaxed">
          {config.description}
        </p>
        
        {onAction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <Button
              onClick={onAction}
              className={`bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white border-0 px-6 py-2`}
            >
              {config.actionLabel}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmptyState;
