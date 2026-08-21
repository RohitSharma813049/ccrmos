import twilio from 'twilio';
import SystemSetting from '@/modules/settings/schemas/SystemSetting';
import dbConnect from '@/lib/db';

/**
 * Send an SMS message using Twilio
 */
export async function sendTwilioSMS(to: string, body: string, companyId?: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    await dbConnect();
    
    // Fetch twilio config
    const settingQuery = companyId ? { key: 'twilio_config', companyId } : { key: 'twilio_config' };
    const setting = await SystemSetting.findOne(settingQuery);

    if (!setting || !setting.value || !setting.value.accountSid || !setting.value.authToken || !setting.value.fromNumber) {
      return { success: false, error: 'Twilio is not configured for this workspace' };
    }

    const { accountSid, authToken, fromNumber } = setting.value;
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });

    return { success: true, messageId: message.sid };
  } catch (error: any) {
    console.error('Failed to send Twilio SMS:', error);
    return { success: false, error: error.message };
  }
}
