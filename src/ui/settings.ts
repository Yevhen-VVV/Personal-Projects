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

/**
 * On a first visit, follow whatever the viewer is already using rather than
 * forcing a light page onto someone reading in the dark. An explicit choice in
 * the app wins from then on, because it is stored.
 */
function preferredTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const stamped = document.documentElement.dataset.theme;
  if (stamped === 'dark' || stamped === 'light') return stamped;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const DEFAULTS: Settings = { textSize: 'large', theme: 'light', autoSpeak: false };

function read(): Settings {
  const base: Settings = { ...DEFAULTS, theme: preferredTheme() };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...base, ...(JSON.parse(raw) as Settings) } : base;
  } catch {
    return base;
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
