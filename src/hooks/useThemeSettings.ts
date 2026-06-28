
import { useState, useEffect } from 'react';

export interface ThemeSettings {
  colorScheme: 'snippedia' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'royal';
  isDarkMode: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  isFocusMode: boolean;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

const COLOR_SCHEMES = {
  snippedia: {
    primary: '#FE2C55',
    secondary: '#20D5EC',
    accent: '#FE2C55',
  },
  ocean: {
    primary: '#0EA5E9',
    secondary: '#06B6D4',
    accent: '#3B82F6',
  },
  forest: {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
  },
  sunset: {
    primary: '#F59E0B',
    secondary: '#EF4444',
    accent: '#F97316',
  },
  midnight: {
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#9333EA',
  },
  royal: {
    primary: '#DC2626',
    secondary: '#B91C1C',
    accent: '#EF4444',
  },
};

const DEFAULT_SETTINGS: ThemeSettings = {
  colorScheme: 'snippedia',
  isDarkMode: true,
  fontSize: 'medium',
  isFocusMode: false,
  accentColor: COLOR_SCHEMES.snippedia.primary,
  backgroundColor: '#121212',
  textColor: '#ffffff',
};

function isThemeSettings(value: unknown): value is Partial<ThemeSettings> {
  return typeof value === 'object' && value !== null;
}

function safeParseThemeSettings(raw: string | null): ThemeSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isThemeSettings(parsed)) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const useThemeSettings = () => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('snippedia-theme-settings');
    return safeParseThemeSettings(saved);
  });

  useEffect(() => {
    localStorage.setItem('snippedia-theme-settings', JSON.stringify(settings));
    
    // Apply theme to document immediately
    const root = document.documentElement;
    const scheme = COLOR_SCHEMES[settings.colorScheme] ?? COLOR_SCHEMES.snippedia;
    
    // Force CSS variables update
    root.style.setProperty('--theme-primary', scheme.primary);
    root.style.setProperty('--theme-secondary', scheme.secondary);
    root.style.setProperty('--theme-accent', scheme.accent);
    root.style.setProperty('--snippedia-red', scheme.primary);
    
    // Also update Tailwind custom properties
    root.style.setProperty('--primary-color', scheme.primary);
    root.style.setProperty('--secondary-color', scheme.secondary);
    root.style.setProperty('--accent-color', scheme.accent);
    
    // Force re-render by adding and removing a class
    document.body.classList.add('theme-updating');
    setTimeout(() => {
      document.body.classList.remove('theme-updating');
    }, 10);
    
    // Apply dark/light mode
    if (settings.isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light-mode');
    } else {
      root.classList.remove('dark');
      root.classList.add('light-mode');
    }
    
    // Apply focus mode
    if (settings.isFocusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const setColorScheme = (scheme: ThemeSettings['colorScheme']) => {
    const colors = COLOR_SCHEMES[scheme];
    updateSettings({ 
      colorScheme: scheme,
      accentColor: colors.primary 
    });
  };

  const toggleDarkMode = () => {
    updateSettings({ isDarkMode: !settings.isDarkMode });
  };

  const setFontSize = (fontSize: ThemeSettings['fontSize']) => {
    updateSettings({ fontSize });
  };

  const toggleFocusMode = () => {
    updateSettings({ isFocusMode: !settings.isFocusMode });
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const getColorSchemeStyles = () => {
    const scheme = COLOR_SCHEMES[settings.colorScheme];
    return {
      '--theme-primary': scheme.primary,
      '--theme-secondary': scheme.secondary,
      '--theme-accent': scheme.accent,
    };
  };

  return {
    settings,
    colorSchemes: COLOR_SCHEMES,
    updateSettings,
    setColorScheme,
    toggleDarkMode,
    setFontSize,
    toggleFocusMode,
    getFontSizeClass,
    getColorSchemeStyles,
  };
};
