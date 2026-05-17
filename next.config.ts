import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/financial_freedom',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rgpadkgvakcenqexwjzn.supabase.co',
      },
    ],
  },
};

export default nextConfig;
