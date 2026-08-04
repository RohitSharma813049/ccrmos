import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  bookingId: string;
  name: string;
  contact: string;
  email: string;
  property: string;
  unit: string;
  totalValue: number;
  paidAmount: number;
  status: "Pending" | "Confirmed" | "Cancelled";
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema({
  bookingId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  property: { type: String, required: true },
  unit: { type: String, default: "N/A" },
  totalValue: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending"
  },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true }
}, { timestamps: true });

// Auto-generate booking ID
BookingSchema.pre("validate", function (next) {
  if (this.isNew && !this.bookingId) {
    // Generate a random 6 character alphanumeric string
    this.bookingId = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  if (typeof next === 'function') (next as any)();
});

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
