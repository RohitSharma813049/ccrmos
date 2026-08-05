import CalendarClient from "@/modules/calendar/components/CalendarClient";

export const metadata = {
  title: "Calendar & Schedule",
};

export default function CalendarPage() {
  return (
    <div className="py-8 font-sans">
      <CalendarClient />
    </div>
  );
}
