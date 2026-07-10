import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVerificationToken extends Document {
  identifier: string; // Email address
  token: string; // The OTP code
  expires: Date;
}

const VerificationTokenSchema: Schema<IVerificationToken> = new Schema({
  identifier: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

// Index to automatically delete expired tokens (TTL index)
VerificationTokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });
// Ensure a combination of identifier and token is unique
VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

const VerificationToken: Model<IVerificationToken> = mongoose.models.VerificationToken || mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;
