import { Metadata } from "next";
import RecycleBinClient from "@/modules/settings/components/RecycleBinClient";

export const metadata: Metadata = {
  title: "Recycle Bin | CRM OS",
  description: "View and restore deleted data.",
};

export default function RecycleBinPage() {
  return <RecycleBinClient />;
}
