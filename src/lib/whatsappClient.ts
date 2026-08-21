import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import dbConnect from './db';
import Lead from '@/modules/leads/schemas/Lead';

interface WhatsAppMetaConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

export const getWhatsAppConfig = async (companyId: string | null): Promise<WhatsAppMetaConfig | null> => {
  await dbConnect();
  const setting = await SystemSetting.findOne({ key: 'whatsapp_meta', companyId });
  if (!setting || !setting.value) return null;
  return setting.value as WhatsAppMetaConfig;
};

export const getWhatsAppStatus = async (companyId: string) => {
  const config = await getWhatsAppConfig(companyId);
  return {
    isConfigured: !!(config?.accessToken && config?.phoneNumberId),
    status: config?.accessToken ? 'CONFIGURED' : 'NOT_CONFIGURED'
  };
};

export const sendWhatsAppMessage = async (companyId: string, to: string, message: string) => {
  const config = await getWhatsAppConfig(companyId);
  
  if (!config || !config.accessToken || !config.phoneNumberId) {
    throw new Error('WhatsApp Meta API is not configured for this company.');
  }

  // Clean phone number: remove non-digits
  let cleanedNumber = to.replace(/\D/g, '');
  
  // Meta Cloud API requires standard E.164 format without the '+'
  const url = `https://graph.facebook.com/v17.0/${config.phoneNumberId}/messages`;
  
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanedNumber,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  
  if (!response.ok) {
    console.error('Meta API Error:', result);
    throw new Error(result.error?.message || 'Failed to send WhatsApp message via Meta API');
  }

  return result;
};

// Function to handle incoming webhook messages and create/update leads
export const processIncomingWhatsAppMessage = async (companyId: string, fromNumber: string, messageBody: string, pushname?: string) => {
  try {
    await dbConnect();
    
    // Meta sends numbers without the '+' usually
    let lead = await Lead.findOne({ companyId, phone: fromNumber });

    if (!lead) {
      console.log('Creating new WhatsApp lead from Meta:', pushname || fromNumber);
      lead = await Lead.create({
        companyId,
        firstName: pushname || 'WhatsApp',
        lastName: 'Lead',
        email: `${fromNumber}@whatsapp.local`, // placeholder
        phone: fromNumber,
        status: "New",
        source: "WhatsApp",
        customData: {
          lastMessage: messageBody,
          whatsappOptIn: true,
          _importDate: new Date().toISOString()
        }
      });
    } else {
      console.log('Updating existing WhatsApp lead from Meta:', lead?.firstName);
      lead.customData = { 
        ...lead.customData, 
        lastMessage: messageBody, 
        whatsappOptIn: true
      };
      await lead.save();
    }
    
    return lead;
  } catch (error) {
    console.error('Error processing incoming WhatsApp message:', error);
    throw error;
  }
};
