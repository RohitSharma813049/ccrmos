import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", userSchema);

const companySchema = new mongoose.Schema({}, { strict: false });
const Company = mongoose.models.Company || mongoose.model("Company", companySchema);

const auditLogSchema = new mongoose.Schema({}, { strict: false });
const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

const workflowLogSchema = new mongoose.Schema({}, { strict: false });
const WorkflowLog = mongoose.models.WorkflowLog || mongoose.model("WorkflowLog", workflowLogSchema);

async function resetDB() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB!");

  // Delete all companies
  const companyResult = await Company.deleteMany({});
  console.log(`Deleted ${companyResult.deletedCount} companies.`);

  // Delete all non-owner users
  const userResult = await User.deleteMany({ hierarchyLevel: { $ne: 1 } });
  console.log(`Deleted ${userResult.deletedCount} non-owner users.`);

  // Delete all logs
  const auditResult = await AuditLog.deleteMany({});
  console.log(`Deleted ${auditResult.deletedCount} audit logs.`);

  const workflowResult = await WorkflowLog.deleteMany({});
  console.log(`Deleted ${workflowResult.deletedCount} workflow logs.`);

  console.log("Database reset complete. Owners are preserved.");
  process.exit(0);
}

resetDB().catch(console.error);
