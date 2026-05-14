import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nbr/shared'],
  webpack: (config, { dev }) => {
    // Locator: instrument only our app + workspace shared sources (not all of node_modules).
    // See apps/web/src/README.md — Next 14 + SWC can omit JSX source metadata without babel.config.
    if (dev) {
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
            loader: path.join(__dirname, 'locator-webpack-loader.cjs'),
            options: { env: 'development' },
          },
        ],
      });
    }
    return config;
  },
};

export default nextConfig;
