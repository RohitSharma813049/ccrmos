import WhatsAppClient from "@/modules/whatsapp/components/WhatsAppClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WhatsApp CRM | CRM OS",
};

export default function WhatsAppPage() {
  return <WhatsAppClient />;
}
