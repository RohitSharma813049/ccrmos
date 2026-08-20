import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAppIntegration extends Document {
  companyId: mongoose.Types.ObjectId;
  appName: "SLACK" | "DOCUSIGN" | "MAILCHIMP" | "ZAPIER" | "GOOGLE_WORKSPACE";
  status: "ACTIVE" | "DISCONNECTED" | "ERROR";
  
  // OAuth Tokens
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  
  // Third-party identifiers
  externalAccountId?: string; // e.g., the Slack Workspace ID
  
  // App-specific configuration
  metadata?: {
    webhookUrl?: string; // e.g., Slack incoming webhook URL
    defaultListId?: string; // e.g., Mailchimp audience list ID
    customMapping?: Record<string, any>;
  };
  
  installedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AppIntegrationSchema: Schema<IAppIntegration> = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  appName: { 
    type: String, 
    enum: ["SLACK", "DOCUSIGN", "MAILCHIMP", "ZAPIER", "GOOGLE_WORKSPACE"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["ACTIVE", "DISCONNECTED", "ERROR"], 
    default: "ACTIVE" 
  },
  
  accessToken: { type: String },
  refreshToken: { type: String },
  tokenExpiresAt: { type: Date },
  
  externalAccountId: { type: String },
  
  metadata: { type: Schema.Types.Mixed, default: {} },
  
  installedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

// A company can only install one instance of a specific app (e.g. one Slack integration)
AppIntegrationSchema.index({ companyId: 1, appName: 1 }, { unique: true });

const AppIntegration: Model<IAppIntegration> = mongoose.models.AppIntegration || mongoose.model<IAppIntegration>("AppIntegration", AppIntegrationSchema);

export default AppIntegration;
