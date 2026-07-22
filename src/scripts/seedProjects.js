const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/crmos').then(async () => {
  const db = mongoose.connection.db;
  
  // Find the tenant founder user
  const founder = await db.collection('users').findOne({ email: 'webesideclient@gmail.com' });
  
  if (!founder) {
    console.log("Could not find founder user");
    process.exit(1);
  }

  // Create some mock projects
  const mockProjects = [
    {
      name: "Website Redesign",
      status: "In Progress",
      founderId: founder._id,
      companyId: founder.companyId,
      createdBy: founder._id,
      customData: {
        budget: "$5,000",
        priority: "High"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Q4 Marketing Campaign",
      status: "Planning",
      founderId: founder._id,
      companyId: founder.companyId,
      createdBy: founder._id,
      customData: {
        budget: "$12,000",
        priority: "Medium"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Client Portal Launch",
      status: "Completed",
      founderId: founder._id,
      companyId: founder.companyId,
      createdBy: founder._id,
      customData: {
        budget: "$15,000",
        priority: "High"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('projects').insertMany(mockProjects);
  console.log("Successfully seeded projects");
  process.exit(0);
});
