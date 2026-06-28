
import { Moon, Sun, Timer, Eye, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { useNightMode } from '../hooks/useNightMode';
import { motion, AnimatePresence } from 'framer-motion';

interface NightModeControlsProps {
  className?: string;
}

const NightModeControls = ({ className = '' }: NightModeControlsProps) => {
  const { 
    settings, 
    toggleNightMode,
    setBlueFilterIntensity,
    setContrastLevel,
    setReadingTimer,
    timeRemaining,
    toggleTimer,
    isTimerActive
  } = useNightMode();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/90 backdrop-blur-sm rounded-lg p-4 space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm flex items-center space-x-2">
          <Moon className="w-4 h-4 text-blue-400" />
          <span>Modo Leitura Noturna</span>
        </h3>
        <Switch
          checked={settings.isNightMode}
          onCheckedChange={toggleNightMode}
        />
      </div>

      <AnimatePresence>
        {settings.isNightMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Blue Light Filter */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-white/70">
                <Eye className="w-4 h-4" />
                <span className="text-xs">Filtro de Luz Azul</span>
              </div>
              <Select value={settings.blueFilterIntensity} onValueChange={setBlueFilterIntensity}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="light" className="text-white hover:bg-white/10">
                    Leve (10%)
                  </SelectItem>
                  <SelectItem value="medium" className="text-white hover:bg-white/10">
                    Médio (25%)
                  </SelectItem>
                  <SelectItem value="strong" className="text-white hover:bg-white/10">
                    Forte (40%)
                  </SelectItem>
                  <SelectItem value="maximum" className="text-white hover:bg-white/10">
                    Máximo (60%)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contrast Level */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-white/70">
                <Palette className="w-4 h-4" />
                <span className="text-xs">Contraste</span>
              </div>
              <Select value={settings.contrastLevel} onValueChange={setContrastLevel}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="normal" className="text-white hover:bg-white/10">
                    Normal
                  </SelectItem>
                  <SelectItem value="high" className="text-white hover:bg-white/10">
                    Alto
                  </SelectItem>
                  <SelectItem value="maximum" className="text-white hover:bg-white/10">
                    Máximo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reading Timer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-white/70">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs">Timer de Leitura</span>
                </div>
                <Switch
                  checked={isTimerActive}
                  onCheckedChange={toggleTimer}
                />
              </div>

              {isTimerActive && (
                <div className="space-y-2">
                  <Select value={settings.readingTimer.toString()} onValueChange={(value) => setReadingTimer(parseInt(value))}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20">
                      <SelectItem value="300" className="text-white hover:bg-white/10">
                        5 minutos
                      </SelectItem>
                      <SelectItem value="600" className="text-white hover:bg-white/10">
                        10 minutos
                      </SelectItem>
                      <SelectItem value="900" className="text-white hover:bg-white/10">
                        15 minutos
                      </SelectItem>
                      <SelectItem value="1800" className="text-white hover:bg-white/10">
                        30 minutos
                      </SelectItem>
                      <SelectItem value="3600" className="text-white hover:bg-white/10">
                        1 hora
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {timeRemaining > 0 && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-center"
                    >
                      <div className="text-blue-300 text-sm font-medium">
                        Tempo restante: {formatTime(timeRemaining)}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${((settings.readingTimer - timeRemaining) / settings.readingTimer) * 100}%` 
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Night Mode Preview */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-3">
              <div className="text-xs text-white/60 mb-2">Efeito Ativo:</div>
              <div className="text-xs text-white/80">
                • Filtro azul: {settings.blueFilterIntensity === 'light' ? '10%' : 
                               settings.blueFilterIntensity === 'medium' ? '25%' :
                               settings.blueFilterIntensity === 'strong' ? '40%' : '60%'}
              </div>
              <div className="text-xs text-white/80">
                • Contraste: {settings.contrastLevel === 'normal' ? 'Normal' :
                             settings.contrastLevel === 'high' ? 'Alto' : 'Máximo'}
              </div>
              {isTimerActive && (
                <div className="text-xs text-white/80">
                  • Timer: {settings.readingTimer / 60} min
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NightModeControls;
