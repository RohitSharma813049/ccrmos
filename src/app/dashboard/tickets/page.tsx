import TicketsClient from "@/modules/tickets/components/TicketsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Helpdesk | CRM OS",
  description: "Manage customer support tickets",
};

export default function TicketsPage() {
  return <TicketsClient />;
}
