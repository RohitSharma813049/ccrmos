import mongoose, { Schema, Document, Model } from "mongoose";
import Role, { IRole } from "@/modules/roles/schemas/Role";

export interface IUser extends Document {
  email: string;
  name?: string;
  role?: mongoose.Types.ObjectId | IRole;
  companyId?: mongoose.Types.ObjectId;
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
}, { timestamps: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
