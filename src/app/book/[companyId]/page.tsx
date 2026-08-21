import PublicBookingClient from "@/modules/bookings/components/PublicBookingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Meeting",
};

// In Next.js 15, dynamic route params must be awaited if accessed directly, 
// but passing the promise to a client component is also a common pattern.
export default async function BookingPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <PublicBookingClient companyId={companyId} />;
}
