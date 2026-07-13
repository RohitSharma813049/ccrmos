import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "amount";
  discountValue: number;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ["percentage", "amount"], required: true },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    maxUses: { type: Number },
    currentUses: { type: Number, default: 0 },
    validUntil: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Coupon || mongoose.model<ICoupon>("Coupon", CouponSchema);
