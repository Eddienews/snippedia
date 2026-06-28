import { useState, useEffect, useCallback } from "react";

export interface ReadingSettings {
  fontSize: number;      // px
  lineHeight: number;    // multiplier
  focusMode: boolean;
  autoScroll: boolean;
  showImages: boolean;
}

const STORAGE_KEY = "snippedia-reading-settings";
const LEGACY_KEY = "wikitok-reading-settings";

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.7,
  focusMode: false,
  autoScroll: false,
  showImages: true,
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const useReadingSettings = () => {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // 1) Prefer new key
    const rawNew = localStorage.getItem(STORAGE_KEY);
    if (rawNew) {
      const current = safeParse<ReadingSettings>(rawNew, DEFAULT_SETTINGS);
      setSettings({ ...DEFAULT_SETTINGS, ...current });
      return;
    }

    // 2) Migrate legacy -> new
    const rawLegacy = localStorage.getItem(LEGACY_KEY);
    if (rawLegacy) {
      const legacy = safeParse<ReadingSettings>(rawLegacy, DEFAULT_SETTINGS);
      const merged = { ...DEFAULT_SETTINGS, ...legacy };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.removeItem(LEGACY_KEY);

      setSettings(merged);
      return;
    }

    setSettings(DEFAULT_SETTINGS);
  }, []);

  const persist = (next: ReadingSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const update = useCallback((patch: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next: ReadingSettings = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    persist(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    update,
    setSettings: update,
    reset,
  };
};
