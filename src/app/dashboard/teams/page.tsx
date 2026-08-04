import { redirect } from 'next/navigation';
import { requireAuthenticatedUser } from '@/lib/auth-utils';
import TeamsClient from '@/modules/companies/components/TeamsClient';

export default async function TeamsPage() {
  const user = await requireAuthenticatedUser();
  if (user.hierarchyLevel > 2) {
    redirect('/dashboard');
  }

  return <TeamsClient />;
}
