import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.broadwaypizza.com.pk' },
      { protocol: 'https', hostname: 'www.broadwaypizza.com.pk' },
      { protocol: 'https', hostname: 'services.broadwaypizza.com.pk' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
