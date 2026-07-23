const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db('test'); // Default DB for mongoose unless specified in URI
    // Wait, the URI has '/crmos?' in it, so it's 'crmos' DB. Let's not pass string to db() to use default from URI.
    const database = client.db();
    const collection = database.collection('leads');

    console.log("Dropping index founderId_1_phone_1...");
    await collection.dropIndex('founderId_1_phone_1');
    console.log("Index dropped successfully.");

  } catch (err) {
    if (err.code === 27) {
      console.log("Index not found, perhaps already dropped.");
    } else {
      console.error("Error:", err);
    }
  } finally {
    await client.close();
  }
}

main();
