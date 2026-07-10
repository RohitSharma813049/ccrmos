import AnalyticsCharts from "@/components/ui/AnalyticsCharts";

export const metadata = {
  title: "Dashboard | CCRM"
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Analytics</h1>
          <p className="text-gray-600 mt-1">Real-time overview of your CRM metrics.</p>
        </div>
      </div>
      
      <AnalyticsCharts />
    </div>
  );
}
