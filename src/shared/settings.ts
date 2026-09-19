import { useSyncExternalStore } from 'react';
import { load, save } from './storage';

export type ReadingFont = 'lexend' | 'opendyslexic' | 'atkinson';
export type Overlay = 'none' | 'blue' | 'yellow' | 'rose' | 'green' | 'peach';
export type TextSize = 's' | 'm' | 'l' | 'xl';
export type Spacing = 'normal' | 'wide' | 'wider';
/** "auto" follows the device (or the host page's theme stamp); the rest are the child's choice. */
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
}

const prefersCalm = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const DEFAULT_SETTINGS: ReadingSettings = {
  font: 'lexend',
  size: 'm',
  spacing: 'wide',
  overlay: 'none',
  theme: 'auto',
  ruler: false,
  bdHelper: true,
  calmMotion: Boolean(prefersCalm),
  speechRate: 0.8,
};

let current: ReadingSettings = typeof window !== 'undefined' ? load('settings', DEFAULT_SETTINGS) : DEFAULT_SETTINGS;
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
