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

loyaltyProfileSchema.pre('save', async function (this: ILoyaltyProfile) {
  let pointsBalance = 0;
  let lifetimePoints = 0;

  if (this.history && this.history.length > 0) {
    for (const tx of this.history) {
      if (tx.type === 'EARNED') {
        pointsBalance += tx.amount;
        lifetimePoints += tx.amount;
      } else if (tx.type === 'REDEEMED') {
        pointsBalance -= tx.amount;
      } else if (tx.type === 'ADJUSTED') {
        pointsBalance += tx.amount;
        if (tx.amount > 0) {
          lifetimePoints += tx.amount;
        }
      }
    }
  }

  this.pointsBalance = pointsBalance;
  this.lifetimePoints = lifetimePoints;

  if (lifetimePoints >= 10000) {
    this.tier = 'Platinum';
  } else if (lifetimePoints >= 5000) {
    this.tier = 'Gold';
  } else if (lifetimePoints >= 1000) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }
});

const LoyaltyProfile: Model<ILoyaltyProfile> = mongoose.models.LoyaltyProfile || mongoose.model<ILoyaltyProfile>('LoyaltyProfile', loyaltyProfileSchema);

export default LoyaltyProfile;
