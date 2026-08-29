import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "avatars.githubusercontent.com", 
      "res.cloudinary.com",
      "s3.amazonaws.com"
    ],
  },
  serverExternalPackages: [
    "@aws-sdk/client-s3",
  ],
};

export default nextConfig;
