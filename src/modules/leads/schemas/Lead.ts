import mongoose, { Schema, Document, Model } from 'mongoose';
import Counter from '@/modules/core/schemas/Counter';

export interface ILead extends Document {
  displayId?: string;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: string;
  source?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Ownership Chain
  departmentId?: mongoose.Types.ObjectId;
  directorId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  teamLeaderId?: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
  
  leadScore?: number;
  activities?: { type: string; description: string; timestamp: Date }[];
  customData?: any;
  
  // Real Estate Fields
  interestedPropertyId?: mongoose.Types.ObjectId;
  budget?: number;
  timeline?: string;
  preferredLocation?: string;
}

const leadSchema = new Schema<ILead>({
  displayId: { type: String, unique: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  founderId: { type: Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, default: 'new' },
  leadScore: { type: Number, min: 1, max: 10, default: 5 },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  activities: [{
    type: { type: String },
    description: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },

  // Real Estate Fields
  interestedPropertyId: { type: Schema.Types.ObjectId, ref: "Property" },
  budget: { type: Number },
  timeline: { type: String },
  preferredLocation: { type: String }
}, { timestamps: true, strict: false });

// A contact may exist in different tenants, but a tenant must not receive the
// same lead twice through a repeated form submission or retry.
leadSchema.index({ founderId: 1, email: 1 }, { unique: true });
leadSchema.index(
  { founderId: 1, phone: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { phone: { $type: "string", $ne: "" } } 
  }
);

leadSchema.pre('save', async function (this: ILead) {
  if (this.isNew && !this.displayId) {
    const counterId = `lead_seq_${this.founderId || this.companyId || 'global'}`;
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 }, $setOnInsert: { companyId: this.companyId, founderId: this.founderId } },
      { new: true, upsert: true }
    );
    this.displayId = `CRM-${String(counter.seq).padStart(4, '0')}`;
  }
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
