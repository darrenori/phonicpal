import { useSyncExternalStore } from 'react';
import { load, save } from './storage';

export type ReadingFont = 'lexend' | 'opendyslexic' | 'atkinson';
export type Overlay = 'none' | 'blue' | 'yellow' | 'rose' | 'green' | 'peach';
export type TextSize = 's' | 'm' | 'l' | 'xl';
export type Spacing = 'normal' | 'wide' | 'wider';
/** The page is bright by default. "auto" follows the device (or the host page's theme stamp) only when chosen. */
export type Theme = 'auto' | 'day' | 'night' | 'contrast';

export interface ReadingSettings {
  font: ReadingFont;
  size: TextSize;
  spacing: Spacing;
  overlay: Overlay;
  theme: Theme;
  ruler: boolean;
  bdHelper: boolean;
  calmMotion: boolean;
  speechRate: number;
  /** Sparky Helps: a grown-up turned on the camera helper. Off until they do. */
  sparkyHelps: boolean;
  /** The first-run tour has been seen. It can always be replayed from Reading tools. */
  tourDone: boolean;
  /** The live camera tile is folded down to a small label. */
  sparkyCamSmall: boolean;
  /** Settings schema version; 2 made the bright day theme the default. */
  v: 2;
}

const prefersCalm = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const DEFAULT_SETTINGS: ReadingSettings = {
  font: 'lexend',
  size: 'm',
  spacing: 'wide',
  overlay: 'none',
  theme: 'day',
  ruler: false,
  bdHelper: true,
  calmMotion: Boolean(prefersCalm),
  speechRate: 0.8,
  sparkyHelps: false,
  sparkyCamSmall: false,
  tourDone: false,
  v: 2,
};

/**
 * Settings saved before v2 stored "auto" as the default theme. Move those readers onto the bright
 * default once, but keep a theme they picked on purpose (night or high contrast).
 */
function loadSettings(): ReadingSettings {
  const stored = load<Partial<Omit<ReadingSettings, 'v'>> & { v?: number }>('settings', {});
  const theme = stored.v === 2 ? (stored.theme ?? 'day') : stored.theme && stored.theme !== 'auto' ? stored.theme : 'day';
  return { ...DEFAULT_SETTINGS, ...stored, theme, v: 2 };
}

let current: ReadingSettings = typeof window !== 'undefined' ? loadSettings() : DEFAULT_SETTINGS;
const listeners = new Set<() => void>();

export function applySettings(s: ReadingSettings = current): void {
  const root = document.documentElement;
  root.dataset.font = s.font;
  root.dataset.size = s.size;
  root.dataset.spacing = s.spacing;
  root.dataset.overlay = s.overlay;
  // data-theme belongs to hosts that embed the page; ours lives on data-pp-theme.
  root.dataset.ppTheme = s.theme;
  root.dataset.motion = s.calmMotion ? 'calm' : 'full';
  root.dataset.bd = s.bdHelper ? 'on' : 'off';
}

export function readSettings(): ReadingSettings {
  return current;
}

export function updateSettings(patch: Partial<ReadingSettings>): void {
  current = { ...current, ...patch };
  save('settings', current);
  applySettings(current);
  listeners.forEach((l) => l());
}

export function resetSettings(): void {
  updateSettings(DEFAULT_SETTINGS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): ReadingSettings {
  return useSyncExternalStore(subscribe, readSettings, readSettings);
}
