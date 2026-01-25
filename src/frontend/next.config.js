/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This tells Next.js to find the 'tests' directory at the root
  // (This is a good practice addition)
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig;
