import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.crmos.app',
  appName: 'crmos',
  webDir: 'public',
  server: {
    url: 'https://crmos-demo-url.vercel.app', // Replace with your live production URL
    cleartext: true
  }
};

export default config;
