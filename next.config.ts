import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "whatsapp-web.js",
    "puppeteer",
    "@aws-sdk/client-s3",
    "otp-extractor",
    "@sparticuz/chromium-min",
  ],
};

export default nextConfig;
