import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: '^keralavedics\\.com$',
          },
        ],
        destination: 'https://www.keralavedics.com/',
        permanent: true,
      },
      {
        source: '/:path+',
        has: [
          {
            type: 'host',
            value: '^keralavedics\\.com$',
          },
        ],
        destination: 'https://www.keralavedics.com/:path+',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
