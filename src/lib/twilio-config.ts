import dbConnect from "@/lib/db";
import SystemSetting from "@/modules/settings/schemas/SystemSetting";

export async function getTwilioConfig(companyId?: string | null) {
  await dbConnect();
  
  // Try to find tenant specific twilio config if provided
  let config = null;
  if (companyId) {
    const tenantConfig = await SystemSetting.findOne({ key: 'twilio_config', companyId });
    if (tenantConfig?.value) {
      config = tenantConfig.value;
    }
  }

  // Fallback to global twilio config
  if (!config) {
    const globalConfig = await SystemSetting.findOne({ key: 'twilio_config', companyId: null });
    if (globalConfig?.value) {
      config = globalConfig.value;
    }
  }

  return {
    accountSid: config?.accountSid || process.env.TWILIO_ACCOUNT_SID,
    authToken: config?.authToken || process.env.TWILIO_AUTH_TOKEN,
    apiKeySid: config?.apiKey || process.env.TWILIO_API_KEY_SID || process.env.TWILIO_API_KEY,
    apiKeySecret: config?.apiSecret || process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_API_SECRET,
    twimlAppSid: config?.twimlAppSid || process.env.TWILIO_TWIML_APP_SID,
    phoneNumber: config?.phoneNumber || process.env.TWILIO_PHONE_NUMBER
  };
}
