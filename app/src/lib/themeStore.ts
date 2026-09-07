'use client';

import { useSyncExternalStore } from 'react';
import {
  applyTheme,
  DEFAULT_THEME,
  readTheme,
  writeTheme,
  type ThemePreference,
} from './theme';

/**
 * Same shape as the tracker store: the preference lives outside React, so the
 * switch reads it through useSyncExternalStore rather than syncing it into
 * state on mount. `getServerSnapshot` returns the default, which is what the
 * prerendered HTML assumes.
 */
let preference: ThemePreference = readTheme();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setThemePreference(next: ThemePreference): void {
  if (next === preference) return;

  preference = next;
  writeTheme(next);
  // The inline script already set the class on first load; this handles changes.
  applyTheme(next);
  for (const listener of listeners) listener();
}

export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(
    subscribe,
    () => preference,
    () => DEFAULT_THEME,
  );
}
