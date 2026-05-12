/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nbr/shared'],
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.module.rules.push({
        test: /\.(tsx|ts|jsx|js)$/,
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
