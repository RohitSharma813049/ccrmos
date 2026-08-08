import mongoose from "mongoose";
import CustomModule from "./src/modules/settings/schemas/CustomModule";
import CompanyModule from "./src/modules/companies/schemas/CompanyModule";

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster0.crmos.mongodb.net/crmos?retryWrites=true&w=majority");
  
  const custom = await CustomModule.find().select("name _id").lean();
  console.log("CustomModules:", custom);
  
  const company = await CompanyModule.find().select("module_id display_name _id").lean();
  console.log("CompanyModules:", company);

  mongoose.disconnect();
}
check();
