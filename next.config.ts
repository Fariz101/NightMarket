import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // 💡 Mengizinkan aset gambar dari server Cloudinary
      },
    ],
  },
};

export default nextConfig;