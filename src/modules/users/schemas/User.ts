import mongoose, { Schema, Document, Model } from "mongoose";
import Role, { IRole } from "@/modules/roles/schemas/Role";

export interface IUser extends Document {
  email: string;
  name?: string;
  role?: mongoose.Types.ObjectId | IRole;
  companyId?: mongoose.Types.ObjectId;
  founderId?: mongoose.Types.ObjectId;
  hierarchyLevel?: number; // 1: Platform Owner, 2: Founder, 3: Director, 4: Manager, 5: Team Leader, 6: Team Member
  departmentId?: mongoose.Types.ObjectId;
  directorId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  teamLeaderId?: mongoose.Types.ObjectId;
  isActive?: boolean;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  fcmTokens?: string[];
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
}

const UserSchema: Schema<IUser> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  founderId: { type: Schema.Types.ObjectId, ref: "User" },
  hierarchyLevel: { type: Number, min: 1, max: 6, default: 6 },
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  directorId: { type: Schema.Types.ObjectId, ref: "User" },
  managerId: { type: Schema.Types.ObjectId, ref: "User" },
  teamLeaderId: { type: Schema.Types.ObjectId, ref: "User" },
  isActive: { type: Boolean, default: true },
  avatarUrl: { type: String },
  phone: { type: String },
  bio: { type: String },
  fcmTokens: [{ type: String }],
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
