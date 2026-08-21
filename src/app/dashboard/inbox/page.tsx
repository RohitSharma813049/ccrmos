import InboxClient from "@/modules/inbox/components/InboxClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unified Inbox | CRM OS",
  description: "Manage your emails, SMS, and communications.",
};

export default function InboxPage() {
  return <InboxClient />;
}
