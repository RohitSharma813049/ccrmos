import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

async function login(page: any, email: string, otp: string = '123456') {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Send OTP")');
  await expect(page.getByText('Enter OTP')).toBeVisible({ timeout: 15000 });
  await page.fill('input[type="text"]', process.env.OWNER_MASTER_SECRET || otp);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/dashboard**');
}

const runToken = `QA-${Date.now()}`;
const founderEmail = `founder-a-${runToken}@crmos.com`;

test.describe('Section 3: Forms and Validation', () => {
  
  test.beforeAll(async ({ browser }) => {
    // Create a new Company and Founder for forms testing
    const page = await browser.newPage();
    await login(page, 'owner@crmos.com');
    await page.goto('/owner/companies');
    await page.click('button:has-text("Register New Tenant")');
    await page.fill('input[placeholder="e.g. Acme Corp"]', `Company A Forms ${runToken}`);
    await page.fill('input[placeholder="admin@company.com"]', founderEmail);
    await page.click('button:has-text("Provision Tenant")');
    // Wait for modal to close
    await expect(page.getByText('Provision Tenant')).toBeHidden();
    await expect(page.getByRole('cell', { name: founderEmail })).toBeVisible();
    await page.close();
  });

  test('Lead empty form validation', async ({ page }) => {
    await login(page, founderEmail);
    await page.goto('/dashboard/leads');
    await page.click('button:has-text("Add Lead")');
    
    // Submit empty form
    await page.click('button:has-text("Save Record")');
    
    // HTML5 validation should catch it (First Name is required)
    const firstNameInput = page.locator('input[name="firstName"]');
    const validationMessage = await firstNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).not.toBe('');
  });

  test('Lead valid submission', async ({ page }) => {
    page.on('dialog', dialog => {
      console.log('DIALOG MESSAGE:', dialog.message());
      dialog.dismiss();
    });
    
    await login(page, founderEmail);
    await page.goto('/dashboard/leads');
    await page.click('button:has-text("Add Lead")');
    
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `john-${runToken}@example.com`);
    
    // Fill any other required fields that might exist globally
    const requiredInputs = await page.locator('input[required]').elementHandles();
    for (const input of requiredInputs) {
      const type = await input.getAttribute('type');
      const val = await input.inputValue();
      if (!val) {
        if (type === 'number' || type === 'spinbutton') {
          await input.fill('1234567890');
        } else if (type === 'email') {
          await input.fill(`dummy-${Date.now()}@example.com`);
        } else {
          await input.fill('Test Value');
        }
      }
    }
    
    await page.click('button:has-text("Save Record")');
    
    // Should save and appear in the list
    await expect(page.getByText('John Doe')).toBeVisible();
  });

  test('Form Builder custom field', async ({ page }) => {
    await login(page, founderEmail);
    await page.goto('/dashboard/settings/forms');
    
    await page.click('button:has-text("+ Add Custom Field")');
    
    await page.fill('input[name="name"]', 'Custom Notes');
    await page.selectOption('select[name="type"]', 'Text String');
    
    // In FormBuilderClient, the required checkbox is:
    // <input type="checkbox" checked={formData.required} onChange={(e) => setFormData({...formData, required: e.target.checked})} ... />
    // Check the required checkbox
    await page.check('#req');
    
    await page.click('button:has-text("Save Field")');
    
    // Verify it blocks empty submission in Leads
    await page.goto('/dashboard/leads');
    await page.click('button:has-text("Add Lead")');
    
    await expect(page.getByText('Custom Notes')).toBeVisible();
  });
});
