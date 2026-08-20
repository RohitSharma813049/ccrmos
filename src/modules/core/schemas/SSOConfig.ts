import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISSOConfig extends Document {
  companyId: mongoose.Types.ObjectId;
  domain: string; // The email domain for routing (e.g., "century21.com")
  provider: "OKTA" | "AZURE_AD" | "CUSTOM_SAML";
  
  // IdP Information
  idpSsoUrl: string; // The URL to redirect the user to (Entry Point)
  idpIssuer: string; // Entity ID of the IdP
  x509Cert: string; // Public cert to verify SAML signatures
  
  // SP Information (The CRM)
  spEntityId: string;
  spAcsUrl: string; // Assertion Consumer Service URL (The Callback)
  
  autoProvisionUsers: boolean; // Just-in-Time provisioning
  defaultRoleId?: mongoose.Types.ObjectId; // If JIT is enabled, what role to assign
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SSOConfigSchema: Schema<ISSOConfig> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, unique: true },
  domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
  provider: { type: String, enum: ["OKTA", "AZURE_AD", "CUSTOM_SAML"], required: true },
  
  idpSsoUrl: { type: String, required: true },
  idpIssuer: { type: String, required: true },
  x509Cert: { type: String, required: true },
  
  spEntityId: { type: String, required: true },
  spAcsUrl: { type: String, required: true },
  
  autoProvisionUsers: { type: Boolean, default: false },
  defaultRoleId: { type: Schema.Types.ObjectId, ref: "GlobalRole" },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Optimize lookups by email domain
SSOConfigSchema.index({ domain: 1, isActive: 1 });

const SSOConfig: Model<ISSOConfig> = mongoose.models.SSOConfig || mongoose.model<ISSOConfig>("SSOConfig", SSOConfigSchema);

export default SSOConfig;
