import type { Metadata, Viewport } from 'next';
import { PorscheDesignSystemProvider } from '@porsche-design-system/components-react/ssr';
// Required as of PDS v4 — components read their colors, fonts, spacing and
// motion from these CSS variables and will not render correctly without them.
import '@porsche-design-system/components-react/index.css';
import './globals.css';
import { SCHEME_CLASS, DEFAULT_THEME, THEME_INIT_SCRIPT } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'Workday Time Tracker',
  description: 'Track how your workday is actually spent — one task at a time.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // One class on <html> is the whole PDS theming mechanism: it drives the CSS
    // `color-scheme` property for the components and our own markup alike. The
    // prerendered value is the default; the script below corrects it from
    // localStorage before first paint, so a dark-mode user sees no white flash.
    <html lang="en" className={SCHEME_CLASS[DEFAULT_THEME]} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <PorscheDesignSystemProvider>{children}</PorscheDesignSystemProvider>
      </body>
    </html>
  );
}
