import React from 'react';
import PropertiesClient from '@/modules/properties/components/PropertiesClient';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties | CRM OS',
  description: 'Manage real estate inventory and properties',
};

export default async function PropertiesPage() {
  await requireAuthenticatedUser();
  return <PropertiesClient />;
}
