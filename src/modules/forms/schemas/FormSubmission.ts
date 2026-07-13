import mongoose from "mongoose";

const FormSubmissionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true, index: true },
  companyId: { type: String, required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true } // JSON map of field id -> value
}, { timestamps: true });

export default mongoose.models.FormSubmission || mongoose.model("FormSubmission", FormSubmissionSchema);
