import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
