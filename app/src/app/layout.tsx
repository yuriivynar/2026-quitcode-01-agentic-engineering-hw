import type { Metadata, Viewport } from 'next';
import { PorscheDesignSystemProvider } from '@porsche-design-system/components-react/ssr';
// Required as of PDS v4 — components read their colors, fonts, spacing and
// motion from these CSS variables and will not render correctly without them.
import '@porsche-design-system/components-react/index.css';
import './globals.css';

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
    // `scheme-light-dark` is the whole PDS theming mechanism: it drives the CSS
    // `color-scheme` property, so components and our own layout follow the OS.
    <html lang="en" className="scheme-light-dark">
      <body>
        <PorscheDesignSystemProvider>{children}</PorscheDesignSystemProvider>
      </body>
    </html>
  );
}
