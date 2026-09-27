/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion', 'date-fns'],
  },
  // No remote images are loaded via next/image today (avatars render
  // with plain <img>). Keep the optimizer closed by default; add a
  // per-host entry here only when a remote Image source is introduced.
  images: {},
};

module.exports = nextConfig;
