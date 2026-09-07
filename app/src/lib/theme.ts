/**
 * PDS v4 has no `theme` prop. Theming is entirely the CSS `color-scheme`
 * property, driven by one class on <html> — that single class themes both the
 * design-system components and our own markup.
 */
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'workday-time-tracker:theme';

export const THEME_PREFERENCES: ThemePreference[] = ['system', 'light', 'dark'];

/** `scheme-light-dark` follows the OS; the other two pin it. */
export const SCHEME_CLASS: Record<ThemePreference, string> = {
  system: 'scheme-light-dark',
  light: 'scheme-light',
  dark: 'scheme-dark',
};

export const DEFAULT_THEME: ThemePreference = 'system';

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as string[]).includes(value);
}

export function readTheme(): ThemePreference {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeTheme(preference: ThemePreference): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage blocked — the class below still applies for this page view.
  }
}

export function applyTheme(preference: ThemePreference): void {
  if (typeof document === 'undefined') return;
  document.documentElement.className = SCHEME_CLASS[preference];
}

/**
 * Runs before first paint, so a dark-mode user never sees a white flash while
 * React hydrates. Built from the constants above so it cannot drift from them.
 */
export const THEME_INIT_SCRIPT = `(function(){try{` +
  `var c=${JSON.stringify(SCHEME_CLASS)};` +
  `var p=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});` +
  `document.documentElement.className=c[p]||c[${JSON.stringify(DEFAULT_THEME)}];` +
  `}catch(e){}})();`;
