import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for bcryptjs and prisma in serverless functions
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
