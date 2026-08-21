import React from 'react';
import { ProjectsClient } from '@/components/projects/ProjectsClient';

export default function ProjectsPage() {
  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Post-Sale Projects</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track escrows, property renovations, and client onboarding workflows.
        </p>
      </div>

      <ProjectsClient />
    </div>
  );
}
