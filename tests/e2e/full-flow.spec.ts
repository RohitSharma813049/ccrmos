import { test, expect } from '@playwright/test';

test('E2E: Full User Flow (Login -> Project -> Form -> Integrations)', async ({ page }) => {
  // 1. Navigate to login
  await page.goto('http://localhost:3000/login');
  
  // 2. Enter email
  await page.fill('input[type="email"]', 'rohitsharma813049@gmail.com');
  await page.click('button:has-text("Send OTP")');
  
  // 3. Enter OTP
  const otpInput = page.locator('input[placeholder="000000"]');
  await otpInput.waitFor({ state: 'visible' });
  await otpInput.fill('123456');
  
  // 4. Submit login
  await page.click('button:has-text("Sign In")');
  
  // 5. Verify redirection to dashboard
  await expect(page).toHaveURL(/.*\/dashboard/);
  await expect(page.locator('text=System Analytics')).toBeVisible();

  // 6. Navigate to Projects & Create a Project
  await page.goto('http://localhost:3000/dashboard/projects');
  await page.click('button:has-text("Add Project")');
  const projectNameInput = page.locator('label:has-text("Project Name") ~ input, input[type="text"]').first();
  await projectNameInput.waitFor({ state: 'visible' });
  await projectNameInput.fill('Global Enterprise Expansion');
  // Assuming the submit button inside the modal says "Create" or similar.
  // Using a generic match for the primary action button.
  await page.keyboard.press('Enter'); 

  // 7. Navigate to Forms & Create a Form
  await page.goto('http://localhost:3000/dashboard/forms');
  
  // Handle the window.prompt dialog
  page.once('dialog', async dialog => {
    await dialog.accept('Global Marketing Lead Capture');
  });
  await page.click('button:has-text("Create New Form")');
  
  // Wait for the form page redirection or let the test continue
  await page.waitForTimeout(2000); 

  // 8. Verify the New Strict Integration Flow
  await page.goto('http://localhost:3000/dashboard/settings/integrations');
  
  // The project dropdown should be visible and Form should be disabled initially
  const projectSelect = page.locator('select').first();
  await projectSelect.waitFor({ state: 'visible' });
  
  // Select the newly created project
  await projectSelect.selectOption({ label: 'Global Enterprise Expansion' });

  // 9. Navigate to Control Center
  await page.goto('http://localhost:3000/owner');
  await expect(page.locator('text=OWNER CONTROL CENTER')).toBeVisible();
  await expect(page.locator('text=Total Companies')).toBeVisible();

  // 10. Navigate to Dynamic Fields and Create a Global Field
  await page.goto('http://localhost:3000/owner/dynamic-fields');
  await page.click('button:has-text("Add New Field")');
  
  // Wait for modal to open
  const fieldNameInput = page.locator('input[placeholder="e.g. Industry Type"]');
  await fieldNameInput.waitFor({ state: 'visible' });
  
  // Fill meaningful global field data
  await fieldNameInput.fill('Global Enterprise ID');
  
  // Select target module (e.g. Project)
  await page.selectOption('select:has-text("Lead")', 'project');
  
  // Submit the new global field
  await page.click('button:has-text("Deploy Field Globally")');
});
