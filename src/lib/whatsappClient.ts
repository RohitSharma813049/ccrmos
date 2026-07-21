import { Client, LocalAuth } from 'whatsapp-web.js';
import chromium from '@sparticuz/chromium';
import qrcode from 'qrcode';
import dbConnect from './db';
import Lead from '@/modules/leads/schemas/Lead';

// Use a global variable to persist the client across hot reloads in Next.js development
declare global {
  var _whatsappClient: Client | null;
  var _whatsappQR: string | null;
  var _whatsappStatus: 'DISCONNECTED' | 'INITIALIZING' | 'QR_READY' | 'CONNECTED';
}

if (!global._whatsappClient) {
  global._whatsappClient = null;
  global._whatsappQR = null;
  global._whatsappStatus = 'DISCONNECTED';
}

export const getWhatsAppStatus = () => {
  return {
    status: global._whatsappStatus,
    qr: global._whatsappQR,
  };
};

export const initializeWhatsAppClient = async (companyId: string) => {
  if (global._whatsappStatus === 'INITIALIZING' || global._whatsappStatus === 'CONNECTED') {
    return;
  }

  global._whatsappStatus = 'INITIALIZING';
  
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  const executablePath = isVercel
    ? await chromium.executablePath()
    : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: companyId }),
    puppeteer: {
      headless: isVercel ? chromium.headless : true,
      executablePath,
      args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
    }
  });

  client.on('qr', async (qr) => {
    console.log('WhatsApp QR RECEIVED');
    try {
      global._whatsappQR = await qrcode.toDataURL(qr);
      global._whatsappStatus = 'QR_READY';
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  });

  client.on('ready', () => {
    console.log('WhatsApp Client is READY!');
    global._whatsappStatus = 'CONNECTED';
    global._whatsappQR = null;
  });

  client.on('message', async (msg) => {
    console.log('WhatsApp MESSAGE RECEIVED', msg.body);
    
    // Only process messages from users, not status broadcasts or groups
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
          lastName: "WhatsApp", // lastName is required by schema
          email: `${phoneNumber}@whatsapp.local`, // email is required by schema
          phone: phoneNumber, // schema uses 'phone' not 'phoneNumber'
          status: "New",
          source: "WhatsApp Web",
          customData: {
            lastMessage: msg.body,
            whatsappOptIn: true,
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
    console.log('WhatsApp Client was DISCONNECTED', reason);
    global._whatsappStatus = 'DISCONNECTED';
    global._whatsappClient = null;
    global._whatsappQR = null;
  });

  global._whatsappClient = client;
  
  try {
    await client.initialize();
  } catch (err: any) {
    console.error('Failed to initialize WhatsApp client:', err);
    global._whatsappStatus = 'DISCONNECTED';
    global._whatsappClient = null;
    global._whatsappQR = null;
  }
};

export const disconnectWhatsAppClient = async () => {
  if (global._whatsappClient) {
    await global._whatsappClient.destroy();
    global._whatsappClient = null;
    global._whatsappQR = null;
    global._whatsappStatus = 'DISCONNECTED';
  }
};
