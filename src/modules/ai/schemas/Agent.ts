import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgent extends Document {
  name: string;
  role: string;
  languages: string;
  phone: string;
  maxDuration: string;
  status: "ACTIVE" | "INACTIVE";
  companyId: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema: Schema<IAgent> = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  languages: { type: String, default: "English" },
  phone: { type: String, default: "" },
  maxDuration: { type: String, default: "5:00" },
  status: { 
    type: String, 
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  },
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  founderId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const Agent: Model<IAgent> = mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

export default Agent;
