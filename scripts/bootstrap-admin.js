require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const roleSchema = new mongoose.Schema({}, { strict: false });
const GlobalRole = mongoose.models.GlobalRole || mongoose.model('GlobalRole', roleSchema);

async function bootstrap() {
  console.log("Connecting to Database...");
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }
  
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Check if owner role exists
  let ownerRole = await GlobalRole.findOne({ name: { $regex: /owner/i } });
  if (!ownerRole) {
    console.log("Creating Owner Role...");
    ownerRole = await GlobalRole.create({
      name: "Owner",
      permissions: { all: true },
      isSystem: true,
      level: 1
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@ccrmos.com";

  // Check if user exists
  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    console.log(`Admin user ${adminEmail} already exists!`);
  } else {
    console.log(`Creating Admin user: ${adminEmail}`);
    admin = await User.create({
      email: adminEmail,
      firstName: "System",
      lastName: "Admin",
      name: "System Admin",
      role: ownerRole._id,
      hierarchyLevel: 1,
      isActive: true,
      createdAt: new Date()
    });
    console.log("Successfully created admin user.");
  }

  console.log("\n=================================");
  console.log("You can now log in with:");
  console.log(`Email: ${adminEmail}`);
  console.log("OTP: " + (process.env.OWNER_MASTER_SECRET || "Use the OTP sent to your email or Redis"));
  console.log("=================================\n");

  process.exit(0);
}

bootstrap().catch(console.error);
