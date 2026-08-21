"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, Mail, Phone, CheckCircle, ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Props {
  companyId: string;
}

export default function PublicBookingClient({ companyId }: Props) {
  const [company, setCompany] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [companyId]);

  const fetchAvailability = async () => {
    try {
      const res = await fetch(`/api/book/${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
        setBookedSlots(data.bookedSlots.map((d: string) => new Date(d).toISOString()));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isPast = date < new Date(new Date().setHours(0,0,0,0));
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      
      const disabled = isPast || isWeekend;

      days.push(
        <button
          key={i}
          disabled={disabled}
          onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${disabled ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'}
            ${isSelected ? 'bg-primary text-white hover:bg-primary/90' : 'text-zinc-700 dark:text-zinc-300'}
          `}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const generateTimeSlots = () => {
    if (!selectedDate) return [];
    
    const slots = [];
    // 9 AM to 5 PM
    for (let i = 9; i <= 16; i++) {
      for (const mins of ['00', '30']) {
        const timeString = `${i.toString().padStart(2, '0')}:${mins}`;
        const slotDate = new Date(selectedDate);
        slotDate.setHours(i, parseInt(mins), 0, 0);
        
        const isBooked = bookedSlots.includes(slotDate.toISOString());
        const isPast = slotDate < new Date();

        if (!isBooked && !isPast) {
          slots.push(timeString);
        }
      }
    }
    return slots;
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !formData.name || !formData.email) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/book/${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString(),
          time: selectedTime
        })
      });
      
      if (res.ok) {
        setStep(3);
      } else {
        toast.error("Failed to book meeting. The slot may have been taken.");
      }
    } catch (e) {
      toast.error("Error booking meeting");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Loading availability...</div>;
  if (!company) return <div className="min-h-screen flex items-center justify-center text-red-500">Company not found or link is invalid.</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-4xl w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800 fade-in">
        
        {/* Left Side: Info */}
        <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold mb-1 uppercase tracking-wider text-xs">{company.name}</h2>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Introductory Call</h1>
          
          <div className="space-y-4">
            <div className="flex items-center text-zinc-600 dark:text-zinc-300">
              <Clock className="w-5 h-5 mr-3 text-zinc-400" />
              <span>30 minutes</span>
            </div>
            <div className="flex items-start text-zinc-600 dark:text-zinc-300">
              <Calendar className="w-5 h-5 mr-3 text-zinc-400 shrink-0" />
              <span>Web Conference details provided upon confirmation.</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Book a meeting with our team to discuss how we can help your business grow.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive */}
        <div className="w-full md:w-2/3 p-8">
          
          {step === 1 && (
            <div className="fade-in">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Select a Date & Time</h3>
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Calendar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"><ChevronRight className="w-5 h-5"/></button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                      <div key={d} className="text-xs font-medium text-zinc-500 h-8 flex items-center justify-center">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {renderCalendar()}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div className="w-full lg:w-48 fade-in flex flex-col h-[320px]">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 text-center">
                      {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {generateTimeSlots().map(time => (
                        <div key={time} className="flex gap-2">
                          <button
                            onClick={() => setSelectedTime(time)}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${selectedTime === time ? 'bg-zinc-800 dark:bg-zinc-700 text-white shadow-sm w-1/2' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-primary hover:border-primary hover:border-2 w-full'}`}
                          >
                            {time}
                          </button>
                          {selectedTime === time && (
                            <button 
                              onClick={() => setStep(2)}
                              className="flex-1 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm fade-in"
                            >
                              Next
                            </button>
                          )}
                        </div>
                      ))}
                      {generateTimeSlots().length === 0 && (
                        <div className="text-center text-sm text-zinc-500 py-4">No slots available on this date.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"><ChevronLeft className="w-5 h-5"/></button>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Enter Details</h3>
              </div>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl mb-6 flex justify-between items-center border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Selected Slot</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{selectedDate?.toLocaleDateString()} at {selectedTime}</span>
                </div>
                <button onClick={() => setStep(1)} className="text-sm text-primary font-medium hover:underline">Change</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name *</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="John Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="john@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 text-base shadow-lg" disabled={submitting}>
                    {submitting ? "Confirming..." : "Schedule Event"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in text-center py-12 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">You are scheduled</h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-8">
                A calendar invitation has been sent to your email address.
              </p>
              
              <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left w-full max-w-md">
                <h4 className="font-bold text-zinc-900 dark:text-white mb-4 border-b border-zinc-200 dark:border-zinc-700 pb-2">Introductory Call</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-zinc-600 dark:text-zinc-300 text-sm">
                    <Calendar className="w-5 h-5 mr-3 text-zinc-400" />
                    <span className="font-medium">{selectedDate?.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})}</span>
                  </div>
                  <div className="flex items-center text-zinc-600 dark:text-zinc-300 text-sm">
                    <Clock className="w-5 h-5 mr-3 text-zinc-400" />
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
