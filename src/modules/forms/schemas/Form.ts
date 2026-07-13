import mongoose from "mongoose";

const FormFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  placeholder: { type: String }
}, { _id: false });

const FormSchema = new mongoose.Schema({
  companyId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  fields: [FormFieldSchema],
  isActive: { type: Boolean, default: true },
  submitButtonText: { type: String, default: "Submit" },
  successMessage: { type: String, default: "Thank you for your submission!" }
}, { timestamps: true });

export default mongoose.models.Form || mongoose.model("Form", FormSchema);
