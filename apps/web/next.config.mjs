import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nbr/shared'],
  webpack: (config, { dev, isServer }) => {
    // Locator: instrument only our app + workspace shared sources (not all of node_modules).
    // See apps/web/src/README.md — Next 14 + SWC can omit JSX source metadata without babel.config.
    if (dev && !isServer) {
      config.module.rules.push({
        test: /\.(tsx|ts|jsx|js)$/,
        include: [
          path.join(__dirname, 'src'),
          path.join(__dirname, '../../packages/shared/src'),
        ],
        exclude: /node_modules/,
        enforce: 'pre',
        use: [
          {
            loader: '@locator/webpack-loader',
            options: { env: 'development' },
          },
        ],
      });
    }
    return config;
  },
};

export default nextConfig;
