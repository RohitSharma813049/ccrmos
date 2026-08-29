import { Metadata } from "next";
import LeadStagesClient from "./LeadStagesClient";

export const metadata: Metadata = {
  title: "Lead Stages & Statuses | CRM OS",
  description: "Configure your lead pipeline stages and statuses",
};

export default function LeadStagesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Lead Stages</h2>
      </div>
      <LeadStagesClient />
    </div>
  );
}
