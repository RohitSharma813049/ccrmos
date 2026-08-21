import PortalTicketsClient from "./PortalTicketsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Tickets | Portal",
};

export default function PortalTicketsPage() {
  return <PortalTicketsClient />;
}
