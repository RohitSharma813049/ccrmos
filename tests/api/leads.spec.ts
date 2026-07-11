import { test, expect } from '@playwright/test';

test.describe('Leads API', () => {
  test('Returns 401 Unauthorized for unauthenticated requests', async ({ request }) => {
    // Attempt to access /api/leads without a valid session cookie
    const response = await request.get('/api/leads');
    
    // We expect a 401 Unauthorized status because the user is not logged in
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });
});
