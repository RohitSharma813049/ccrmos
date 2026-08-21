import SystemSetting from "@/modules/settings/schemas/SystemSetting";
import dbConnect from "@/lib/db";
import Invoice from "@/modules/invoices/schemas/Invoice";

/**
 * Gets a valid QuickBooks Online access token.
 */
export async function getQuickBooksAccessToken(companyId: string): Promise<string> {
  await dbConnect();
  
  const settingQuery = companyId ? { key: 'quickbooks_config', companyId } : { key: 'quickbooks_config' };
  const setting = await SystemSetting.findOne(settingQuery);
  
  if (!setting || !setting.value || !setting.value.clientId || !setting.value.clientSecret || !setting.value.refreshToken) {
    throw new Error('QuickBooks is not configured or authenticated.');
  }

  const { clientId, clientSecret, refreshToken } = setting.value;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to refresh QuickBooks token: ${data.error_description || 'Unknown error'}`);
  }

  // Update the refresh token
  setting.value.refreshToken = data.refresh_token;
  setting.markModified('value');
  await setting.save();

  return data.access_token;
}

/**
 * Syncs a CRM Invoice to QuickBooks Online.
 */
export async function syncInvoiceToQuickbooks(invoiceId: string, companyId: string) {
  const accessToken = await getQuickBooksAccessToken(companyId);
  const settingQuery = companyId ? { key: 'quickbooks_config', companyId } : { key: 'quickbooks_config' };
  const setting = await SystemSetting.findOne(settingQuery);
  
  const realmId = setting?.value?.realmId;
  if (!realmId) throw new Error("QuickBooks Realm ID is missing");

  const invoice = await Invoice.findById(invoiceId).populate('customer_id');
  if (!invoice) throw new Error("Invoice not found");

  // In a real integration, we'd first check if the customer exists in QBO,
  // create them if they don't, map line items, and push the invoice.
  // For this demonstration, we'll hit the Sandbox API and log the payload.
  
  const payload = {
    Line: [
      {
        Amount: invoice.total_amount,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: {
            value: "1", // Sandbox default item
            name: "Services"
          }
        }
      }
    ],
    CustomerRef: {
      value: "1" // Sandbox default customer
    }
  };

  const isSandbox = true; // Use sandbox for dev
  const baseUrl = isSandbox ? "https://sandbox-quickbooks.api.intuit.com" : "https://quickbooks.api.intuit.com";

  const response = await fetch(`${baseUrl}/v3/company/${realmId}/invoice?minorversion=65`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to sync to QBO: ${JSON.stringify(data)}`);
  }

  // Save the QBO ID back to the invoice
  if (!invoice.customData) invoice.customData = {};
  invoice.customData.qboInvoiceId = data.Invoice.Id;
  await invoice.save();

  return data.Invoice.Id;
}
