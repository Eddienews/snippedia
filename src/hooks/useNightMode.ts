import { useState, useEffect, useCallback } from "react";

export interface NightModeSettings {
  enabled: boolean;
  overlay: string; // rgba(...) string
  intensity: number; // 0..1
}

const STORAGE_KEY = "snippedia-night-mode-settings";
const LEGACY_KEY = "wikitok-night-mode-settings";

const DEFAULT_SETTINGS: NightModeSettings = {
  enabled: false,
  overlay: "rgba(255, 200, 150, 0.05)",
  intensity: 0.05,
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const useNightMode = () => {
  const [settings, setSettings] = useState<NightModeSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // 1) Prefer new key
    const rawNew = localStorage.getItem(STORAGE_KEY);
    if (rawNew) {
      const current = safeParse<NightModeSettings>(rawNew, DEFAULT_SETTINGS);
      setSettings({ ...DEFAULT_SETTINGS, ...current });
      return;
    }

    // 2) Migrate legacy -> new
    const rawLegacy = localStorage.getItem(LEGACY_KEY);
    if (rawLegacy) {
      const legacy = safeParse<NightModeSettings>(rawLegacy, DEFAULT_SETTINGS);
      const merged = { ...DEFAULT_SETTINGS, ...legacy };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.removeItem(LEGACY_KEY);

      setSettings(merged);
      return;
    }

    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Apply CSS vars/classes to document
  useEffect(() => {
    const root = document.documentElement;

    if (settings.enabled) {
      root.classList.add("night-mode");
      // CSS uses --night-overlay
      root.style.setProperty("--night-overlay", settings.overlay);
    } else {
      root.classList.remove("night-mode");
      root.style.removeProperty("--night-overlay");
    }
  }, [settings.enabled, settings.overlay]);

  const persist = (next: NightModeSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const update = useCallback((patch: Partial<NightModeSettings>) => {
    setSettings((prev) => {
      const next: NightModeSettings = { ...prev, ...patch };

      // If intensity provided without overlay, derive overlay from intensity
      if (patch.intensity != null && patch.overlay == null) {
        const i = Math.min(1, Math.max(0, patch.intensity));
        next.intensity = i;
        next.overlay = `rgba(255, 200, 150, ${i})`;
      }

      persist(next);
      return next;
    });
  }, []);

  // Toggle using functional update (avoids stale closure)
  const toggle = useCallback(() => {
    setSettings((prev) => {
      const next: NightModeSettings = { ...prev, enabled: !prev.enabled };
      persist(next);
      return next;
    });
  }, []);

  return {
    settings,
    setSettings: update,
    update,
    toggle,
  };
};
