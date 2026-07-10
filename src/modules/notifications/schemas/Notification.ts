import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  recipient: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  link?: string;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    isRead: { type: Boolean, default: false },
    link: { type: String },
    companyId: { type: String },
  },
  { timestamps: true }
);

const Notification: Model<INotification> = 
  mongoose.models.Notification || mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;
