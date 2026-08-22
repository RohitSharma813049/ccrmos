import CampaignsClient from "@/modules/campaigns/components/CampaignsClient";

export const metadata = {
  title: "Email Campaigns | CRM OS",
};

export default function CampaignsPage() {
  return (
    <div className="p-8">
      <CampaignsClient />
    </div>
  );
}
