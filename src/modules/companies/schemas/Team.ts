import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  name: string;
  departmentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  permissions: string[];
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema<ITeam> = new Schema(
  {
    name: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    permissions: [{ type: String }],
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
