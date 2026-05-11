/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@nbr/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
