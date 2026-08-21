import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode';

// Define a global to cache the client across hot reloads in dev
declare global {
  var whatsappClient: Client | undefined;
  var whatsappQrCodeUrl: string | undefined;
  var isWhatsAppReady: boolean;
}

let client: Client;

if (process.env.NODE_ENV === 'production') {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });
} else {
  if (!global.whatsappClient) {
    global.whatsappClient = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });
    global.isWhatsAppReady = false;
  }
  client = global.whatsappClient;
}

// Ensure event listeners are only added once
if (!client.listenerCount('qr')) {
  client.on('qr', async (qr) => {
    try {
      console.log('WhatsApp QR Code received');
      const url = await qrcode.toDataURL(qr);
      global.whatsappQrCodeUrl = url;
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  });

  client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    global.isWhatsAppReady = true;
    global.whatsappQrCodeUrl = undefined; // clear QR code once connected
  });

  client.on('authenticated', () => {
    console.log('WhatsApp Authenticated');
  });

  client.on('auth_failure', (msg) => {
    console.error('WhatsApp Auth failure', msg);
    global.isWhatsAppReady = false;
  });
  
  client.on('disconnected', (reason) => {
    console.log('WhatsApp disconnected:', reason);
    global.isWhatsAppReady = false;
    // Client must be re-initialized when disconnected
  });

  // Prevent Puppeteer from crashing the Vercel build process
  // Vercel sets CI=1 during the build phase, but not at runtime
  if (process.env.CI || process.env.VERCEL_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
    console.log('Skipping WhatsApp initialization during build phase');
  } else {
    try {
      client.initialize();
    } catch (e) {
      console.log('WhatsApp client already initializing', e);
    }
  }
}

export const getWhatsAppStatus = () => {
  return {
    isReady: global.isWhatsAppReady || false,
    qrUrl: global.whatsappQrCodeUrl || null
  };
};

export const sendMessage = async (to: string, message: string) => {
  if (!global.isWhatsAppReady) {
    throw new Error('WhatsApp client is not ready. Please scan the QR code.');
  }
  
  // Clean phone number: remove non-digits
  const cleanedNumber = to.replace(/\D/g, '');
  
  // Format for WhatsApp: country code + number + @c.us
  // Assuming numbers without country codes are local/US (prefix with 1 if needed, or enforce E.164 in DB)
  // For safety, require standard format or infer it. We'll assume the number is fully qualified here without the '+'
  const chatId = `${cleanedNumber}@c.us`;
  
  return await client.sendMessage(chatId, message);
};

export default client;
