import mongoose from 'mongoose';

const RecycleBinSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  },
  originalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  collectionName: {
    type: String,
    required: true,
  },
  documentData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

export default mongoose.models.RecycleBin || mongoose.model('RecycleBin', RecycleBinSchema);
