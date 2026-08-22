import mongoose, { Schema, Document, Model } from "mongoose";
import Counter from "@/modules/core/schemas/Counter";

export interface ITicket extends Document {
  displayId: string;
  companyId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: "Open" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Urgent";
  assignedUserId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId | string; // user id or "client_portal"
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema<ITicket> = new Schema(
  {
    displayId: { type: String, unique: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["Open", "Pending", "Resolved", "Closed"], default: "Open" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], default: "Medium" },
    assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.Mixed, required: true }, // Mixed because it could be a User ObjectId or "client_portal" string
    tags: [{ type: String }],
  },
  { timestamps: true }
);

TicketSchema.pre<ITicket>("save", async function () {
  if (this.isNew && !this.displayId) {
    const counter = await Counter.findOneAndUpdate(
      { companyId: this.companyId, modelName: "Ticket" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.displayId = `TKT-${counter.seq.toString().padStart(4, "0")}`;
  }
});

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;
