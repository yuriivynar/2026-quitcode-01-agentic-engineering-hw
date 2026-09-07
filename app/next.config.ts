import type { NextConfig } from 'next';

/**
 * The app is entirely client-side, so it can be exported as static files and
 * served from GitHub Pages. Pages serves a project site from a subdirectory,
 * hence the basePath.
 *
 * Everything here is opt-in via GITHUB_PAGES so a normal `npm run dev` /
 * `npm run build` is completely unaffected.
 */
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const repository = '2026-quitcode-01-agentic-engineering-hw';

const nextConfig: NextConfig = isGithubPages
  ? {
      output: 'export',
      basePath: `/${repository}`,
      assetPrefix: `/${repository}/`,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
