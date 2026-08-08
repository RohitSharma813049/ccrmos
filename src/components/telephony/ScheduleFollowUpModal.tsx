"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ScheduleFollowUpModalProps {
  onClose: () => void;
  onSave: (date: string, remark: string) => void;
  initialDate?: string;
  initialRemark?: string;
}

export default function ScheduleFollowUpModal({ onClose, onSave, initialDate, initialRemark }: ScheduleFollowUpModalProps) {
  const [date, setDate] = useState(initialDate || "");
  const [remark, setRemark] = useState(initialRemark || "");

  const handleSave = () => {
    if (!date) return;
    onSave(date, remark);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-foreground">Schedule Follow-up</h3>
        
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Date & Time *</label>
          <input 
            type="datetime-local" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none" 
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Remark / Agenda</label>
          <textarea 
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none min-h-[80px]"
            placeholder="e.g. Discuss the latest pricing proposal..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!date}>Schedule</Button>
        </div>
      </div>
    </div>
  );
}
