import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoyaltyTransaction {
  type: 'EARNED' | 'REDEEMED' | 'ADJUSTED';
  amount: number;
  reason: string;
  date: Date;
}

export interface ILoyaltyProfile extends Document {
  customerId: mongoose.Types.ObjectId;
  pointsBalance: number;
  lifetimePoints: number;
  tier: string;
  history: ILoyaltyTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ILoyaltyTransaction>({
  type: { type: String, enum: ['EARNED', 'REDEEMED', 'ADJUSTED'], required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const loyaltyProfileSchema = new Schema<ILoyaltyProfile>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    pointsBalance: { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 },
    tier: { type: String, default: 'Bronze', enum: ['Bronze', 'Silver', 'Gold', 'Platinum'] },
    history: [transactionSchema]
  },
  { timestamps: true }
);

const LoyaltyProfile: Model<ILoyaltyProfile> = mongoose.models.LoyaltyProfile || mongoose.model<ILoyaltyProfile>('LoyaltyProfile', loyaltyProfileSchema);

export default LoyaltyProfile;
