import { test, expect } from '@playwright/test';
import { buildTenantQuery } from '../../src/lib/access-control';

test.describe('Access Control - buildTenantQuery', () => {
  test('Platform Owner sees everything (empty query)', () => {
    const user = { hierarchyLevel: 1 };
    const query = buildTenantQuery(user);
    expect(query).toEqual({});
  });

  test('Platform Owner impersonating sees only that founder tenant', () => {
    const user = { hierarchyLevel: 1, impersonatedFounderId: 'founder123' };
    const query = buildTenantQuery(user);
    expect(query).toEqual({ founderId: 'founder123' });
  });

  test('Founder sees their own tenant', () => {
    const user = { hierarchyLevel: 2, id: 'founder456' };
    const query = buildTenantQuery(user);
    expect(query).toEqual({ founderId: 'founder456' });
  });

  test('Employee sees their founder tenant', () => {
    const user = { hierarchyLevel: 6, founderId: 'founder789' };
    const query = buildTenantQuery(user);
    expect(query).toEqual({ founderId: 'founder789' });
  });

  test('Invalid user or unassigned employee sees nothing', () => {
    const user = { hierarchyLevel: 6 }; // No founderId
    const query = buildTenantQuery(user);
    expect(query).toEqual({ _id: null });
  });
});
