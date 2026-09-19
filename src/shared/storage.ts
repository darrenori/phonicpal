/**
 * Device-only persistence. Storage can be missing or throw (private windows,
 * blocked site data, embedded previews), so every access is guarded and the
 * app always has an in-memory fallback.
 */

const memory = new Map<string, string>();
const PREFIX = 'phonicpal:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key) ?? memory.get(key) ?? null;
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    const raw = memory.get(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  }
}

export function save<T>(key: string, value: T): void {
  const raw = JSON.stringify(value);
  memory.set(key, raw);
  try {
    window.localStorage.setItem(PREFIX + key, raw);
  } catch {
    // Memory copy keeps the session working.
  }
}

export function clear(key: string): void {
  memory.delete(key);
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    // Nothing to clear.
  }
}
