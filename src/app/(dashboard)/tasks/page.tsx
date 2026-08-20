import React from 'react';
import { TasksClient } from '@/components/tasks/TasksClient';

export default function TasksPage() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Tasks & Workflows</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your daily to-do list, follow-ups, and internal workflows.
        </p>
      </div>

      <TasksClient />
    </div>
  );
}
