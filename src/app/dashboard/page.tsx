import AnalyticsCharts from "@/components/ui/AnalyticsCharts";
import PageHeader from "@/components/ui/PageHeader";
import DashboardQuickActions from "@/components/ui/DashboardQuickActions";

export const metadata = {
  title: "Dashboard | CCRM"
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 fade-in pb-12">
      <PageHeader 
        title="System Analytics" 
        description="Real-time overview of your CRM metrics." 
      />
      
      <DashboardQuickActions />
      
      <AnalyticsCharts />
    </div>
  );
}
