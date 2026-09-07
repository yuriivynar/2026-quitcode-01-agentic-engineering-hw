'use client';

import {
  PSegmentedControl,
  PSegmentedControlItem,
} from '@porsche-design-system/components-react/ssr';
import { setThemePreference, useThemePreference } from '@/lib/themeStore';
import { isThemePreference } from '@/lib/theme';

const OPTIONS = [
  { value: 'system', label: 'System', icon: 'theme' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' },
] as const;

export function ThemeSwitch() {
  const preference = useThemePreference();

  return (
    <PSegmentedControl
      compact
      // Without a fixed column count the control wraps into a stack in a
      // narrow flex item, which collides with the rest of the header.
      columns={3}
      label="Colour theme"
      hideLabel
      value={preference}
      onChange={(event) => {
        const next = event.detail.value;
        if (isThemePreference(next)) setThemePreference(next);
      }}
    >
      {OPTIONS.map((option) => (
        <PSegmentedControlItem key={option.value} value={option.value} icon={option.icon}>
          {option.label}
        </PSegmentedControlItem>
      ))}
    </PSegmentedControl>
  );
}
