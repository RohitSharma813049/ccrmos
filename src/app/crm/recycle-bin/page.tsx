import { Metadata } from "next";
import LeadsClient from "@/modules/leads/components/LeadsClient";

export const metadata: Metadata = {
  title: "Recycle Bin | CRM OS",
  description: "View and restore archived leads.",
};

export default function RecycleBinPage() {
  return <LeadsClient initialShowRecycleBin={true} />;
}
