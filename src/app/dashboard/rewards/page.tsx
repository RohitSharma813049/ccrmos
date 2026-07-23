import React from 'react';
import RewardsClient from '@/modules/rewards/components/RewardsClient';

export const metadata = {
  title: 'Royalty & Rewards | CRMOS',
  description: 'Manage customer loyalty points and rewards',
};

export default function RewardsPage() {
  return (
    <div className="p-6">
      <RewardsClient />
    </div>
  );
}
