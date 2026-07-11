import { test, expect } from '@playwright/test';

// Helper function to log in
async function login(page: any, email: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.click('button:has-text("Send OTP")');
  await expect(page.getByText('Enter OTP')).toBeVisible({ timeout: 15000 });
  await page.fill('input[type="text"]', '123456');
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('**/dashboard**');
}

test.describe('Comprehensive Role-Based Access & Sidebar Testing', () => {
  test('Platform Owner sees all Control Center links and no tenant data', async ({ page }) => {
    // 1. Log in as Platform Owner
    await login(page, 'owner@crmos.com');
    
    // 2. Owner should NOT see tenant data like Lead Management on the main dashboard
    await expect(page.getByRole('link', { name: 'Lead Management' })).toBeHidden();
    
    // 3. Navigate to Control Center
    const controlCenterLink = page.getByRole('link', { name: 'Go to Control Center' });
    await expect(controlCenterLink).toBeVisible();
    await controlCenterLink.click();
    await page.waitForURL('**/owner**');
    
    // 4. Verify Owner sees ALL Global Management links
    await expect(page.getByRole('link', { name: 'Manage Companies' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Subscriptions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'White-Labeling' })).toBeVisible();

    // 5. Verify Owner sees ALL Dynamic Engine links
    await expect(page.getByRole('link', { name: 'Dynamic Fields' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Module Builder' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'AI Configuration' })).toBeVisible();

    // 6. Verify Owner sees ALL System links
    await expect(page.getByRole('link', { name: 'Global Settings & Templates' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Workflow Engine' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Roles & Permissions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Security & API' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Audit Logs' })).toBeVisible();
    
    // 7. Click a random module to ensure it loads
    await page.getByRole('link', { name: 'Module Builder' }).click();
    await page.waitForURL('**/owner/modules**');
    await expect(page.getByText('Dynamic Module Builder')).toBeVisible();
  });

  test('Founder sees all Company Admin links but no Owner settings', async ({ page }) => {
    await login(page, 'founderA@crmos.com');
    
    // Founder sees Tenant Modules
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Workbench' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lead Management' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Customers' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Orders' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Invoices' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tasks' })).toBeVisible();
    
    // Founder sees ALL Company Admin settings
    await expect(page.getByRole('link', { name: 'Form Builder' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Roles & Permissions' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'User Management' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Director Management' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Global Automations' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'API & Integrations' })).toBeVisible();
    
    // Founder does NOT see global Control Center
    await expect(page.getByRole('link', { name: 'Go to Control Center' })).toBeHidden();
  });

  test('Restricted Team Member sees only assigned modules and no admin settings', async ({ page }) => {
    await login(page, 'membera@crmos.com'); // Lowercase 'a' to match seed
    
    // Member sees standard modules
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Workbench' })).toBeVisible();

    // Member has explicit view access to Leads
    await expect(page.getByRole('link', { name: 'Lead Management' })).toBeVisible();
    
    // Member has NO view access to Customers (based on our seed)
    await expect(page.getByRole('link', { name: 'Customers' })).toBeHidden();
    
    // Member cannot see ANY Company Admin settings
    await expect(page.getByRole('link', { name: 'Form Builder' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Roles & Permissions' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'User Management' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Director Management' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Global Automations' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'API & Integrations' })).toBeHidden();

    // Member cannot see Owner link
    await expect(page.getByRole('link', { name: 'Go to Control Center' })).toBeHidden();
  });
});
