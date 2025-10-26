import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-68bb760998324b59b97c4622e8ba2d68.r2.dev",
      },
    ],
  },
};

export default nextConfig;
