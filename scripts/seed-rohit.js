require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to download image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302) {
        return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
      }
      const stream = fs.createWriteStream(filepath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(true);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Dummy Schemas to interact with DB directly without Next.js imports
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const leadSchema = new mongoose.Schema({}, { strict: false });
const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);

const propertySchema = new mongoose.Schema({}, { strict: false });
const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

const roleSchema = new mongoose.Schema({}, { strict: false });
const GlobalRole = mongoose.models.GlobalRole || mongoose.model('GlobalRole', roleSchema);

const companySchema = new mongoose.Schema({}, { strict: false });
const Company = mongoose.models.Company || mongoose.model('Company', companySchema);

async function runSeed() {
  console.log("Connecting to Database...");
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env.local");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Download images
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  console.log("Downloading dummy images...");
  const dummyAvatar = path.join(uploadDir, 'dummy-avatar.jpg');
  const dummyProperty = path.join(uploadDir, 'dummy-property.jpg');
  const dummyLead = path.join(uploadDir, 'dummy-lead.jpg');
  
  await downloadImage('https://picsum.photos/200', dummyAvatar);
  await downloadImage('https://picsum.photos/600/400', dummyProperty);
  await downloadImage('https://picsum.photos/201', dummyLead);
  
  console.log("Images downloaded successfully to public/uploads/.");

  // Find a target company/founder
  const ownerRole = await GlobalRole.findOne({ name: { $regex: /owner/i } });
  let admin = null;
  if (ownerRole) {
    admin = await User.findOne({ role: ownerRole._id });
  }
  if (!admin) {
    admin = await User.findOne();
  }

  if (!admin) {
    console.error("No users found in database to attach dummy data to.");
    process.exit(1);
  }

  const companyId = admin.companyId;
  const founderId = admin.founderId || admin._id;

  console.log(`Seeding data for Founder: ${founderId}, Company: ${companyId}`);

  // Cleanup old dummy data
  await User.deleteMany({ email: "jane.sales@example.com" });
  await Property.deleteMany({ title: { $in: ["Luxury Beachfront Villa", "Downtown Modern Apartment"] } });
  await Lead.deleteMany({ email: { $in: ["john@acme.com", "sarah@gmail.com"] } });
  await Task.deleteMany({ title: { $in: ["Follow up with Acme Corp", "Site Visit at Ocean Dr"] } });
  console.log("Cleaned up old dummy data.");

  // Create Users
  const dummyUsers = [
    {
      email: "jane.sales@example.com",
      firstName: "Jane",
      lastName: "Sales",
      name: "Jane Sales",
      role: ownerRole ? ownerRole._id : null,
      companyId,
      founderId,
      hierarchyLevel: 3,
      createdAt: new Date(),
      image: "/uploads/dummy-avatar.jpg"
    }
  ];
  const insertedUsers = await User.insertMany(dummyUsers);
  console.log(`Inserted ${insertedUsers.length} Dummy Users.`);

  // Create Properties
  const dummyProperties = [
    {
      title: "Luxury Beachfront Villa",
      address: "123 Ocean Dr",
      price: 1500000,
      bedrooms: 4,
      bathrooms: 3,
      area: 3200,
      description: "Beautiful beachfront villa.",
      status: "Available",
      images: ["/uploads/dummy-property.jpg"],
      companyId,
      founderId,
      createdAt: new Date()
    },
    {
      title: "Downtown Modern Apartment",
      address: "456 City Center",
      price: 850000,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      description: "Modern high-rise apartment with city views.",
      status: "Available",
      images: ["/uploads/dummy-property.jpg"],
      companyId,
      founderId,
      createdAt: new Date()
    }
  ];
  const insertedProperties = await Property.insertMany(dummyProperties);
  console.log(`Inserted ${insertedProperties.length} Dummy Properties.`);

  // Create Leads
  const dummyLeads = [
    {
      displayId: "LD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: "Acme Corp Lead",
      firstName: "John",
      lastName: "Doe",
      email: "john@acme.com",
      phone: "+1234567890",
      status: "New",
      type: "B2B",
      companyId,
      founderId,
      createdAt: new Date(),
      attachments: [{ url: "/uploads/dummy-lead.jpg", name: "Profile" }]
    },
    {
      displayId: "LD-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: "Sarah Smith",
      firstName: "Sarah",
      lastName: "Smith",
      email: "sarah@gmail.com",
      phone: "+9876543210",
      status: "Contacted",
      type: "B2C",
      companyId,
      founderId,
      createdAt: new Date(),
      attachments: [{ url: "/uploads/dummy-lead.jpg", name: "Profile" }]
    }
  ];
  const insertedLeads = await Lead.insertMany(dummyLeads);
  console.log(`Inserted ${insertedLeads.length} Dummy Leads.`);

  // Create Tasks (Calendar Events)
  const dummyTasks = [
    {
      displayId: "TSK-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      title: "Follow up with Acme Corp",
      type: "Meeting",
      startTime: new Date(new Date().setHours(10, 0, 0, 0)),
      endTime: new Date(new Date().setHours(11, 0, 0, 0)),
      location: "https://meet.google.com/xyz",
      status: "Pending",
      attendees: ["john@acme.com", "jane.sales@example.com"],
      companyId,
      founderId,
      createdAt: new Date(),
      description: "Discuss follow-up action items."
    },
    {
      displayId: "TSK-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      title: "Site Visit at Ocean Dr",
      type: "Site Visit",
      startTime: new Date(new Date().setDate(new Date().getDate() + 1)),
      endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0, 0, 0)),
      location: "123 Ocean Dr",
      status: "Pending",
      companyId,
      founderId,
      createdAt: new Date(),
      description: "Show property to Sarah Smith."
    }
  ];
  const insertedTasks = await Task.insertMany(dummyTasks);
  console.log(`Inserted ${insertedTasks.length} Dummy Tasks/Events.`);

  console.log("Seeding complete!");
  process.exit(0);
}

runSeed().catch(console.error);
