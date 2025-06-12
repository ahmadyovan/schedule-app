import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // gunakan `false` jika ini hanya sementara
      },
    ];
  },
};

export default nextConfig;
