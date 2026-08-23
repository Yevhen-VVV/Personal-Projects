import { useEffect, useState } from 'react';

export type TextSize = 'normal' | 'large' | 'largest';
export type Theme = 'light' | 'dark';

export interface Settings {
  textSize: TextSize;
  theme: Theme;
  /** Read each question aloud automatically when it appears. */
  autoSpeak: boolean;
}

const KEY = 'esl.settings.v1';

const SCALE: Record<TextSize, number> = { normal: 1, large: 1.2, largest: 1.45 };

export const DEFAULTS: Settings = { textSize: 'large', theme: 'light', autoSpeak: false };

function read(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Settings) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(read);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scale', String(SCALE[settings.textSize]));
    root.dataset.theme = settings.theme;
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      // Nothing to do -- the setting just will not survive a reload.
    }
  }, [settings]);

  return [settings, setSettings] as const;
}

export const TEXT_SIZES: { value: TextSize }[] = [
  { value: 'normal' },
  { value: 'large' },
  { value: 'largest' },
];
