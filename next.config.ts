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
    "whatsapp-web.js",
    "puppeteer",
    "@aws-sdk/client-s3",
    "otp-extractor",
    "@sparticuz/chromium-min",
  ],
};

export default nextConfig;
