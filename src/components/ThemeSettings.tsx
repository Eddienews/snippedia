
import { useState, useEffect } from "react";
import { 
  Settings, 
  Palette, 
  Sun, 
  Moon, 
  Type, 
  Eye, 
  EyeOff,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useThemeSettings } from "../hooks/useThemeSettings";
import { useToast } from "@/hooks/use-toast";

interface ThemeSettingsProps {
  isMobile?: boolean;
}

const ThemeSettings = ({ isMobile = false }: ThemeSettingsProps) => {
  const {
    settings,
    colorSchemes,
    setColorScheme,
    toggleDarkMode,
    setFontSize,
    toggleFocusMode,
  } = useThemeSettings();
  
  const [open, setOpen] = useState(isMobile);
  const { toast } = useToast();

  // Auto-open when in mobile mode
  useEffect(() => {
    if (isMobile) {
      setOpen(true);
    }
  }, [isMobile]);

  const colorSchemeOptions = [
    { value: 'snippedia', label: 'Snippedia', color: '#FE2C55' },
    { value: 'ocean', label: 'Ocean', color: '#0EA5E9' },
    { value: 'forest', label: 'Forest', color: '#10B981' },
    { value: 'sunset', label: 'Sunset', color: '#F59E0B' },
    { value: 'midnight', label: 'Midnight', color: '#8B5CF6' },
    { value: 'royal', label: 'Royal', color: '#DC2626' },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small', preview: 'Aa' },
    { value: 'medium', label: 'Medium', preview: 'Aa' },
    { value: 'large', label: 'Large', preview: 'Aa' },
    { value: 'extra-large', label: 'Extra Large', preview: 'Aa' },
  ];

  const handleApplyTheme = () => {
    const selectedTheme = colorSchemeOptions.find(option => option.value === settings.colorScheme);
    toast({
      title: "Theme applied successfully! ✨",
      description: `${selectedTheme?.label} theme applied. Font size: ${fontSizeOptions.find(f => f.value === settings.fontSize)?.label}`,
      duration: 3000,
    });
    setOpen(false);
  };

  const handleThemeChange = (themeValue: string) => {
    setColorScheme(themeValue as any);
    const selectedTheme = colorSchemeOptions.find(option => option.value === themeValue);
    toast({
      title: `${selectedTheme?.label} theme selected`,
      description: "Changes applied instantly",
      duration: 2000,
    });
  };

  if (isMobile) {
    return (
      <div className="bg-black/90 backdrop-blur-sm border border-white/20 text-white rounded-lg p-4 w-full max-w-md mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Palette className="h-5 w-5 text-snippedia-red" />
          <span className="text-lg font-semibold">Theme Settings</span>
        </div>
        
        <div className="space-y-6">
          {/* Color Scheme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Color Scheme</label>
            <div className="grid grid-cols-2 gap-2">
              {colorSchemeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    settings.colorScheme === option.value
                      ? 'border-white/40 bg-white/10 ring-2 ring-white/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-sm">{option.label}</span>
                    {settings.colorScheme === option.value && (
                      <Check className="h-4 w-4 text-green-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark/Light Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.isDarkMode ? (
                <Moon className="h-4 w-4 text-blue-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <Switch
              checked={settings.isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80 flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Font Size</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value as any)}
                  className={`p-3 rounded-lg border transition-all ${
                    settings.fontSize === option.value
                      ? 'border-white/40 bg-white/10 ring-2 ring-white/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    <span 
                      className={`font-bold ${
                        option.value === 'small' ? 'text-sm' :
                        option.value === 'medium' ? 'text-base' :
                        option.value === 'large' ? 'text-lg' : 'text-xl'
                      }`}
                    >
                      {option.preview}
                    </span>
                    {settings.fontSize === option.value && (
                      <Check className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.isFocusMode ? (
                <EyeOff className="h-4 w-4 text-purple-400" />
              ) : (
                <Eye className="h-4 w-4 text-green-400" />
              )}
              <div>
                <span className="text-sm font-medium">Focus Mode</span>
                <p className="text-xs text-white/60">Hide distractions during reading</p>
              </div>
            </div>
            <Switch
              checked={settings.isFocusMode}
              onCheckedChange={toggleFocusMode}
            />
          </div>

          {/* Apply Button */}
          <div className="flex items-center space-x-3 pt-4 border-t border-white/20">
            <Button
              onClick={handleApplyTheme}
              className="flex-1 bg-snippedia-red hover:bg-snippedia-red/80 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Theme
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-black/90 backdrop-blur-sm border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-snippedia-red" />
            <span>Theme Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Color Scheme Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80">Color Scheme</label>
            <div className="grid grid-cols-2 gap-2">
              {colorSchemeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`p-3 rounded-lg border transition-all ${
                    settings.colorScheme === option.value
                      ? 'border-white/40 bg-white/10 ring-2 ring-white/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="text-sm">{option.label}</span>
                    {settings.colorScheme === option.value && (
                      <Check className="h-4 w-4 text-green-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dark/Light Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.isDarkMode ? (
                <Moon className="h-4 w-4 text-blue-400" />
              ) : (
                <Sun className="h-4 w-4 text-yellow-400" />
              )}
              <span className="text-sm font-medium">Dark Mode</span>
            </div>
            <Switch
              checked={settings.isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white/80 flex items-center space-x-2">
              <Type className="h-4 w-4" />
              <span>Font Size</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value as any)}
                  className={`p-3 rounded-lg border transition-all ${
                    settings.fontSize === option.value
                      ? 'border-white/40 bg-white/10 ring-2 ring-white/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    <span 
                      className={`font-bold ${
                        option.value === 'small' ? 'text-sm' :
                        option.value === 'medium' ? 'text-base' :
                        option.value === 'large' ? 'text-lg' : 'text-xl'
                      }`}
                    >
                      {option.preview}
                    </span>
                    {settings.fontSize === option.value && (
                      <Check className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {settings.isFocusMode ? (
                <EyeOff className="h-4 w-4 text-purple-400" />
              ) : (
                <Eye className="h-4 w-4 text-green-400" />
              )}
              <div>
                <span className="text-sm font-medium">Focus Mode</span>
                <p className="text-xs text-white/60">Hide distractions during reading</p>
              </div>
            </div>
            <Switch
              checked={settings.isFocusMode}
              onCheckedChange={toggleFocusMode}
            />
          </div>

          {/* Current Theme Preview */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/20">
            <div className="text-xs text-white/60 mb-2">Preview</div>
            <div className={`space-y-2 ${settings.fontSize === 'small' ? 'text-sm' : settings.fontSize === 'large' ? 'text-lg' : settings.fontSize === 'extra-large' ? 'text-xl' : 'text-base'}`}>
              <h3 className="font-bold" style={{ color: colorSchemes[settings.colorScheme].primary }}>
                Article Title
              </h3>
              <p className="text-white/80">
                This is how your articles will look with the current theme settings.
              </p>
              <Badge 
                className="text-xs"
                style={{ 
                  backgroundColor: colorSchemes[settings.colorScheme].accent + '20',
                  color: colorSchemes[settings.colorScheme].accent
                }}
              >
                Sample Tag
              </Badge>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex items-center space-x-3 pt-4 border-t border-white/20">
            <Button
              onClick={handleApplyTheme}
              className="flex-1 bg-snippedia-red hover:bg-snippedia-red/80 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Theme
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
