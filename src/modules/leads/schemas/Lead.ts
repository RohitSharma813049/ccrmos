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
  stageId?: mongoose.Types.ObjectId;
  source?: string;
  notes?: string;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Ownership Chain
  departmentId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  directorId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  teamLeaderId?: mongoose.Types.ObjectId;
  assignedUserId?: mongoose.Types.ObjectId;
  
  leadScore?: number;
  activities?: { type: string; description: string; timestamp: Date; attachmentUrl?: string }[];
  customData?: any;
  
  // Real Estate Fields
  interestedPropertyId?: mongoose.Types.ObjectId;
  budget?: number;
  currency?: string;
  timeline?: string;
  preferredLocation?: string;
  bhkOrPlotSize?: string;
  possessionStatus?: string;
  
  // Advanced Categorization & Tracking
  category?: string;
  enquiryType?: string;
  priority?: string;
  requirementType?: string;
  tags?: string[];
  campaignName?: string;
  
  // Pipeline & Sales
  channelPartnerId?: mongoose.Types.ObjectId;
  dealValue?: number;
  expectedClosingDate?: Date;
  lostReason?: string;
  
  // Contact Center & Telephony
  whatsAppStatus?: string;
  callRecordings?: string[]; // URLs
  documents?: string[]; // URLs
  
  // Location
  city?: string;
  state?: string;
  
  // Follow-up Tracking
  nextFollowUpDate?: Date;
  lastFollowUpDate?: Date;
  lastRemark?: string;
  totalFollowUpCount?: number;
  
  // Client Portal Access
  hasPortalAccess?: boolean;
  portalPasswordHash?: string;
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
  stageId: { type: Schema.Types.ObjectId, ref: 'LeadStage' },
  leadScore: { type: Number, min: 1, max: 10, default: 5 },
  customData: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  activities: [{
    type: { type: String },
    description: String,
    attachmentUrl: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  teamId: { type: Schema.Types.ObjectId, ref: "Team" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  assignedUserId: { type: Schema.Types.ObjectId, ref: "User" },

  // Real Estate Fields
  interestedPropertyId: { type: Schema.Types.ObjectId, ref: "Property" },
  budget: {
    type: Number,
  },
  currency: {
    type: String,
    default: "USD"
  },
  timeline: { type: String },
  preferredLocation: { type: String },
  bhkOrPlotSize: { type: String },
  possessionStatus: { type: String },
  
  // Advanced Categorization & Tracking
  category: { type: String },
  enquiryType: { type: String },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  requirementType: { type: String },
  tags: [{ type: String }],
  campaignName: { type: String },
  
  // Pipeline & Sales
  channelPartnerId: { type: Schema.Types.ObjectId, ref: "User" },
  dealValue: { type: Number },
  expectedClosingDate: { type: Date },
  lostReason: { type: String },
  
  // Contact Center & Telephony
  whatsAppStatus: { type: String },
  callRecordings: [{ type: String }],
  documents: [{ type: String }],
  
  // Location
  city: { type: String },
  state: { type: String },
  
  // Follow-up Tracking
  nextFollowUpDate: { type: Date },
  lastFollowUpDate: { type: Date },
  lastRemark: { type: String },
  totalFollowUpCount: { type: Number, default: 0 },
  
  // Client Portal Access
  hasPortalAccess: { type: Boolean, default: false },
  portalPasswordHash: { type: String }
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

  // Calculate dynamic leadScore based on completion and priority
  let score = 2; // Base score

  if (this.email || this.phone) score += 2;
  if (this.budget && this.budget > 0) score += 2;
  if (this.priority === 'High') score += 2;
  if (this.preferredLocation || this.timeline) score += 1;
  if (this.channelPartnerId || (this.dealValue && this.dealValue > 0)) score += 1;

  // Ensure score stays between 1 and 10
  this.leadScore = Math.min(Math.max(score, 1), 10);
});

const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', leadSchema);
export default Lead;
