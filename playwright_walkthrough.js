const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: 'C:\\Users\\Rohit Sharma\\.gemini\\antigravity-ide\\brain\\b3e45ddf-f8c9-47f1-b28c-4c8e7d50deed\\',
      size: { width: 1280, height: 720 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    console.log("Navigating to login page...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    
    console.log("Filling login info...");
    
    // Wait for the email input
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.fill('input[type="email"]', 'john@apexrealestate.com');
    await page.waitForTimeout(1000);
    
    await page.click('button[type="submit"]');
    console.log("Clicked Send OTP...");
    
    // Wait for OTP input to appear
    await page.waitForSelector('input[placeholder="000000"]', { timeout: 10000 });
    await page.waitForTimeout(2000); // Give the user time to see the OTP screen in the video
    
    console.log("Video recorded up to OTP screen.");
    
  } catch (error) {
    console.error("Error during walkthrough:", error);
  } finally {
    // Close context to ensure video is saved
    await context.close();
    await browser.close();
    console.log("Done recording video.");
  }
})();
