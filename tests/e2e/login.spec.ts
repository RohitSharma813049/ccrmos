import { test, expect } from '@playwright/test';

test('E2E: Login and navigate to owner dashboard', async ({ page }) => {
  // 1. Navigate to login
  await page.goto('http://localhost:3000/login');
  
  // 2. Enter email
  await page.fill('input[type="email"]', 'rohitsharma813049@gmail.com');
  await page.click('button:has-text("Send OTP")');
  
  // 3. Enter OTP
  // Wait for the OTP input to appear
  const otpInput = page.locator('input[placeholder="000000"]');
  await otpInput.waitFor({ state: 'visible' });
  await otpInput.fill('123456');
  
  // 4. Submit login
  await page.click('button:has-text("Sign In")');
  
  // 5. Verify redirection to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
  await expect(page.locator('text=System Analytics')).toBeVisible();

  // 6. Navigate to Control Center
  await page.goto('http://localhost:3000/owner');
  await expect(page.locator('text=OWNER CONTROL CENTER')).toBeVisible();
  
  // 7. Verify control center data renders
  await expect(page.locator('text=Total Companies')).toBeVisible();
});
