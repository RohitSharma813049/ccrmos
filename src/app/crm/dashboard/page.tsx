import { Metadata } from 'next';
import DashboardClient from '@/modules/dashboard/components/DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | CRM OS',
  description: 'System overview & team activities',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
