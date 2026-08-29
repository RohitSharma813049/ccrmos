import React from 'react';
import { TeamClient } from '@/components/team/TeamClient';

export default function TeamPage() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Team Management</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Invite users, manage roles, and monitor team activity.
        </p>
      </div>

      <TeamClient />
    </div>
  );
}
