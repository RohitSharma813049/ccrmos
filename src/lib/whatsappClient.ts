import { Client, LocalAuth } from 'whatsapp-web.js';
import chromium from '@sparticuz/chromium-min';
import qrcode from 'qrcode';
import dbConnect from './db';
import Lead from '@/modules/leads/schemas/Lead';

type WhatsAppStatus = 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED';

interface WhatsAppSession {
  client: Client | null;
  qr: string | null;
  status: WhatsAppStatus;
  timeoutId?: NodeJS.Timeout;
}

// Use a global variable to persist multiple clients across hot reloads
declare global {
  var _whatsappSessions: Map<string, WhatsAppSession>;
}

if (!global._whatsappSessions) {
  global._whatsappSessions = new Map<string, WhatsAppSession>();
}

export const getWhatsAppStatus = (scopeId: string) => {
  const session = global._whatsappSessions.get(scopeId) || { status: 'DISCONNECTED', qr: null, client: null };
  return {
    status: session.status,
    qr: session.qr,
  };
};

export const initializeWhatsAppClient = async (companyId: string, scopeId: string = companyId) => {
  let session = global._whatsappSessions.get(scopeId);
  
  if (session && (session.status === 'INITIALIZING' || session.status === 'CONNECTED')) {
    return;
  }

  session = {
    client: null,
    qr: null,
    status: 'INITIALIZING'
  };
  global._whatsappSessions.set(scopeId, session);
  
  const initTimeout = setTimeout(() => {
    const s = global._whatsappSessions.get(scopeId);
    if (s && s.status === 'INITIALIZING') {
      console.error(`WhatsApp initialization timed out for scope: ${scopeId}`);
      global._whatsappSessions.set(scopeId, { ...s, status: 'DISCONNECTED', client: null, qr: null });
    }
  }, 45000); // 45 seconds safety timeout
  
  session.timeoutId = initTimeout;
  
  try {
    const isProd = process.env.NODE_ENV === 'production';
    const isServerless = process.env.NODE_ENV === 'production' && process.platform !== 'win32';
    let puppeteerConfig: any = { headless: true };
    
    // Add Browserless WebSocket support for Vercel
    if (process.env.BROWSERLESS_TOKEN) {
      puppeteerConfig.browserWSEndpoint = `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`;
    } else {
      const executablePath = isServerless
        ? await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar')
        : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      
      puppeteerConfig.executablePath = executablePath;
      puppeteerConfig.args = isServerless ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'];
    }

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: scopeId,
        dataPath: isServerless ? '/tmp/.wwebjs_auth' : './.wwebjs_auth'
      }),
      puppeteer: puppeteerConfig
    });

    let qrCount = 0;
    const MAX_QR_RETRIES = 5; // Usually generated every ~20 seconds

    client.on('qr', async (qr) => {
      qrCount++;
      if (qrCount > MAX_QR_RETRIES) {
        console.log(`WhatsApp QR limit reached for ${scopeId}. Destroying client to save resources.`);
        client.destroy();
        global._whatsappSessions.delete(scopeId);
        return;
      }

      console.log(`WhatsApp QR RECEIVED for ${scopeId} (Attempt ${qrCount}/${MAX_QR_RETRIES})`);
      try {
        const qrUrl = await qrcode.toDataURL(qr);
        const s = global._whatsappSessions.get(scopeId);
        if (s) {
          global._whatsappSessions.set(scopeId, { ...s, qr: qrUrl, status: 'QR_READY' });
        }
      } catch (err) {
        console.error(`Failed to generate QR code for ${scopeId}`, err);
      }
    });

    client.on('ready', () => {
      console.log(`WhatsApp Client is READY for ${scopeId}!`);
      const s = global._whatsappSessions.get(scopeId);
      if (s) {
        global._whatsappSessions.set(scopeId, { ...s, status: 'CONNECTED', qr: null });
      }
    });

    client.on('message', async (msg) => {
      console.log(`WhatsApp MESSAGE RECEIVED for ${scopeId}`, msg.body);
      
      if (msg.from === 'status@broadcast' || msg.from.includes('@g.us')) return;

      try {
        await dbConnect();
        
        const contact = await msg.getContact();
        const phoneNumber = contact.number;
        const name = contact.pushname || contact.name || "WhatsApp Lead";

        let lead = await Lead.findOne({ companyId, phone: phoneNumber });

        if (!lead) {
          console.log('Creating new WhatsApp lead:', name);
          lead = await Lead.create({
            companyId,
            firstName: name,
            lastName: "WhatsApp",
            email: `${phoneNumber}@whatsapp.local`,
            phone: phoneNumber,
            status: "New",
            source: "WhatsApp Web",
            customData: {
              lastMessage: msg.body,
              whatsappOptIn: true,
              integrationScopeId: scopeId,
              _importDate: new Date().toISOString()
            }
          });
        } else {
          console.log('Updating existing WhatsApp lead:', name);
          lead.customData = { 
            ...lead.customData, 
            lastMessage: msg.body, 
            whatsappOptIn: true
          };
          await lead.save();
        }
      } catch (error) {
        console.error('Error processing WhatsApp message:', error);
      }
    });

    client.on('disconnected', (reason) => {
      console.log(`WhatsApp Client was DISCONNECTED for ${scopeId}`, reason);
      global._whatsappSessions.delete(scopeId);
    });

    session.client = client;
    global._whatsappSessions.set(scopeId, session);
    
    await client.initialize();
    clearTimeout(initTimeout);
  } catch (err: any) {
    clearTimeout(initTimeout);
    console.error(`Failed to initialize WhatsApp client for ${scopeId}:`, err);
    global._whatsappSessions.delete(scopeId);
    throw new Error(err.message || 'Failed to initialize Chrome in serverless environment.');
  }
};

export const disconnectWhatsAppClient = async (scopeId: string) => {
  const session = global._whatsappSessions.get(scopeId);
  if (session && session.client) {
    await session.client.destroy();
    global._whatsappSessions.delete(scopeId);
  }
};
