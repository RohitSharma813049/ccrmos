import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow login using master secret', async ({ page }) => {
    // Go to the login page
    await page.goto('/login');

    // Fill in a test email
    await page.fill('input[type="email"]', 'owner@crmos.com');
    await page.click('button:has-text("Send OTP")');

    // Wait for the OTP screen to appear (give it up to 15 seconds in case Next.js is compiling the API route in dev mode)
    await expect(page.getByText('Enter OTP')).toBeVisible({ timeout: 15000 });

    // Use the OWNER_MASTER_SECRET bypass
    await page.fill('input[type="text"]', '123456');
    await page.click('button:has-text("Sign In")');

    // Wait for successful redirect to the dashboard
    await page.waitForURL('**/dashboard**');
    
    // Verify we are on the live dashboard (look for the desktop sidebar heading which is visible)
    await expect(page.getByRole('heading', { name: 'CRM OS' }).last()).toBeVisible();
  });
});
