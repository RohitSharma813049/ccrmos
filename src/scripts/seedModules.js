const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const customFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: { type: [String], default: [] }
});

const customModuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: false },
  fields: { type: [customFieldSchema], default: [] },
  tenantScope: { type: String, default: "Global" },
  industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', default: null },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
}, { timestamps: true });

const industrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CustomModule = mongoose.models.CustomModule || mongoose.model("CustomModule", customModuleSchema);
const Industry = mongoose.models.Industry || mongoose.model("Industry", industrySchema);

async function seedModules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const industriesToSeed = [
      {
        name: "Real Estate",
        moduleName: "Property Listings",
        fields: [
          { name: "Property Name", type: "text", required: true },
          { name: "Price", type: "number", required: true },
          { name: "Square Footage", type: "number", required: false },
          { name: "Status", type: "select", required: true, options: ["Available", "Under Contract", "Sold"] }
        ]
      },
      {
        name: "Healthcare",
        moduleName: "Patient Encounters",
        fields: [
          { name: "Encounter Date", type: "date", required: true },
          { name: "Doctor Name", type: "text", required: true },
          { name: "Diagnosis", type: "textarea", required: false },
          { name: "Severity", type: "select", required: true, options: ["Low", "Medium", "High", "Critical"] }
        ]
      },
      {
        name: "EdTech",
        moduleName: "Course Enrollments",
        fields: [
          { name: "Course Name", type: "text", required: true },
          { name: "Student ID", type: "text", required: true },
          { name: "Enrollment Date", type: "date", required: true },
          { name: "Status", type: "select", required: true, options: ["Active", "Completed", "Dropped"] }
        ]
      },
      {
        name: "Financial Services",
        moduleName: "Loan Applications",
        fields: [
          { name: "Applicant Name", type: "text", required: true },
          { name: "Loan Amount", type: "number", required: true },
          { name: "Credit Score", type: "number", required: false },
          { name: "Status", type: "select", required: true, options: ["Pending", "Under Review", "Approved", "Rejected"] }
        ]
      }
    ];

    for (const data of industriesToSeed) {
      const industry = await Industry.findOne({ name: data.name });
      if (industry) {
        await CustomModule.findOneAndUpdate(
          { name: data.moduleName, industryId: industry._id },
          {
            $set: {
              name: data.moduleName,
              active: true,
              fields: data.fields,
              tenantScope: "Industry",
              industryId: industry._id
            }
          },
          { upsert: true, new: true }
        );
        console.log(`Seeded module '${data.moduleName}' for industry '${data.name}'`);
      } else {
        console.log(`Industry '${data.name}' not found, skipping module '${data.moduleName}'`);
      }
    }
    
    // Seed a global module too
    await CustomModule.findOneAndUpdate(
      { name: "Support Tickets", tenantScope: "Global" },
      {
        $set: {
          name: "Support Tickets",
          active: true,
          fields: [
            { name: "Issue Title", type: "text", required: true },
            { name: "Description", type: "textarea", required: true },
            { name: "Priority", type: "select", required: true, options: ["Low", "Medium", "High", "Urgent"] },
            { name: "Status", type: "select", required: true, options: ["Open", "In Progress", "Resolved", "Closed"] }
          ],
          tenantScope: "Global",
          industryId: null,
          companyId: null
        }
      },
      { upsert: true, new: true }
    );
    console.log("Seeded global module 'Support Tickets'");

    const Company = mongoose.models.Company || mongoose.model("Company", new mongoose.Schema({ name: String }, { strict: false }));
    const companies = await Company.find().limit(2);
    
    if (companies.length > 0) {
      for (const comp of companies) {
        const moduleName = `Feedback Form for ${comp.name}`;
        await CustomModule.findOneAndUpdate(
          { name: moduleName, companyId: comp._id },
          {
            $set: {
              name: moduleName,
              active: true,
              fields: [
                { name: "Customer Name", type: "text", required: true },
                { name: "Rating", type: "select", required: true, options: ["1", "2", "3", "4", "5"] },
                { name: "Feedback", type: "textarea", required: false }
              ],
              tenantScope: "Company",
              industryId: null,
              companyId: comp._id
            }
          },
          { upsert: true, new: true }
        );
        console.log(`Seeded company module '${moduleName}' for company '${comp.name}'`);
      }
    } else {
      console.log("No companies found to seed company modules.");
    }

    console.log(`Finished seeding modules.`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding modules:", error);
    process.exit(1);
  }
}

seedModules();
