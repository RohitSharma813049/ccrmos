import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIProvider extends Document {
  name: string;               // e.g. "OpenAI", "Anthropic", "Custom Llama"
  description: string;        // e.g. "Used for general chat and summarizing leads"
  endpointUrl: string;        // e.g. "https://api.openai.com/v1"
  apiKey: string;             // Owner's Global API Key
  defaultModel: string;       // e.g. "gpt-4o"
  isActive: boolean;          // Globally enable/disable this provider
  icon: string;               // SVG path or name
  color: string;              // e.g. "blue", "fuchsia"
  allowTenantOverride: boolean; // If true, tenants can supply their own keys
}

const aiProviderSchema = new Schema<IAIProvider>({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  endpointUrl: { type: String, default: "" },
  apiKey: { type: String, default: "" },
  defaultModel: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  icon: { type: String, default: "M13 10V3L4 14h7v7l9-11h-7z" },
  color: { type: String, default: "fuchsia" },
  allowTenantOverride: { type: Boolean, default: true }
}, { timestamps: true });

const AIProvider: Model<IAIProvider> = mongoose.models.AIProvider || mongoose.model<IAIProvider>('AIProvider', aiProviderSchema);
export default AIProvider;
