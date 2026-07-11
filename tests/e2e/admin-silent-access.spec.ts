import { test, expect } from '@playwright/test';

// Use standard master key bypass if OWNER_MASTER_SECRET isn't overridden in env, or use standard mock for tests.
// In tests, standard OTP is '123456'. We assume owner@crmos.com is seeded.
async function loginAsOwner(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'owner@crmos.com');
  await page.click('button:has-text("Send OTP")');
  await expect(page.getByText('Enter OTP')).toBeVisible({ timeout: 15000 });
  // Master bypass or standard test mock bypass
  await page.fill('input[type="text"]', process.env.OWNER_MASTER_SECRET || '123456');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/dashboard**');
  await page.goto('/owner');
}

test.describe('Silent Admin Access & Cleanup', () => {
  test('Platform Owner can silently impersonate, create data, verify no logs, and cleanup', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes just in case

    // 1. Log in as Platform Owner
    await loginAsOwner(page);
    await expect(page.getByText('Platform Overview')).toBeVisible();

    // 2. Go to Companies list and impersonate the first available company
    await page.goto('/owner/companies');
    // Click on the first company in the list
    await page.locator('table tbody tr:first-child a').first().click();
    
    // In the company details, click 'View Dashboard as Tenant'
    await page.click('button:has-text("View Dashboard as Tenant")');
    await page.waitForURL('**/dashboard');
    
    // Ensure we are impersonating (wait for load)
    await page.waitForLoadState('networkidle');

    // 3. Create Testing Data (A Lead)
    await page.goto('/dashboard/leads');
    // This test verifies silent impersonation, not a tenant's custom field rules.
    // Keep it independent from required fields created by the form-builder suite.
    await page.route('**/api/dynamic-fields?target=lead', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ fields: [] })
      });
    });
    await page.click('button:has-text("Add Lead")');
    
    const uniqueTestName = `SilentAdminTest_${Date.now()}`;
    await page.fill('input[name="firstName"]', uniqueTestName);
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `test_${Date.now()}@example.com`);
    await page.click('button:has-text("Save Record")');
    
    // Wait for the modal to close and lead to appear
    await expect(page.getByText(uniqueTestName)).toBeVisible({ timeout: 10000 });

    // 4. End Impersonation and Verify NO Audit Log
    // Stop impersonating
    await page.click('button:has-text("Exit Tenant View")');
    await page.waitForURL('**/owner/companies**');

    // Go to Audit Logs
    await page.goto('/owner/audit');
    // Search for the unique test name or just look at the most recent logs
    await expect(page.getByRole('heading', { name: 'Global Audit Logs' })).toBeVisible();
    
    // We expect that the uniqueTestName is NOT in the audit logs because the admin was silent.
    // If it was logged, it would show up here.
    await expect(page.locator(`text=${uniqueTestName}`)).toBeHidden();

    // 5. Re-impersonate and Cleanup
    // We must clean up the test data so it doesn't pollute the environment
    await page.goto('/owner/companies');
    await page.locator('table tbody tr:first-child a').first().click();
    await page.click('button:has-text("View Dashboard as Tenant")');
    await page.waitForURL('**/dashboard');

    // Delete the lead we created via DB to guarantee it's removed (since UI delete is not yet implemented)
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crmos');
    await mongoose.connection.collection('leads').deleteMany({ firstName: { $regex: 'SilentAdminTest_' } });
    await mongoose.disconnect();
    
    // End Impersonation again
    await page.goto('/dashboard'); // Need to be on a dashboard page to see the banner sometimes, but let's just click it
    await page.click('button:has-text("Exit Tenant View")');
    await page.waitForURL('**/owner/companies**');
  });
});
