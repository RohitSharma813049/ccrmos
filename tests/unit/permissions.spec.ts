import { test, expect } from '@playwright/test';
import { hasModulePermission, SessionUser } from '../../src/lib/permissions';

test.describe('Permissions Utility', () => {
  test('Platform Owner (Level 1) has full access', () => {
    const user: SessionUser = {
      id: '1',
      email: 'owner@crmos.com',
      hierarchyLevel: 1,
      permissions: {}
    };

    expect(hasModulePermission(user, 'Leads', 'view')).toBe(true);
    expect(hasModulePermission(user, 'Invoices', 'delete')).toBe(true);
  });

  test('User with explicit permission has access', () => {
    const user: SessionUser = {
      id: '2',
      email: 'manager@example.com',
      hierarchyLevel: 4,
      permissions: {
        Leads: { view: true, create: true },
        Customers: { view: false }
      }
    };

    expect(hasModulePermission(user, 'Leads', 'view')).toBe(true);
    expect(hasModulePermission(user, 'Leads', 'create')).toBe(true);
    expect(hasModulePermission(user, 'Leads', 'delete')).toBe(false);
    expect(hasModulePermission(user, 'Customers', 'view')).toBe(false);
  });

  test('User without permission config fails securely', () => {
    const user: SessionUser = {
      id: '3',
      email: 'member@example.com',
      hierarchyLevel: 6
    };

    expect(hasModulePermission(user, 'Leads', 'view')).toBe(false);
  });
});
