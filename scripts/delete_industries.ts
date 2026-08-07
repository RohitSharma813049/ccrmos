import mongoose from "mongoose";
import Industry from "../src/modules/settings/schemas/Industry";

async function run() {
  await mongoose.connect("mongodb://webesideclient_db_user:jRKVp1F6M0bmaUS3@ac-dn8bz9t-shard-00-00.0qbmn57.mongodb.net:27017,ac-dn8bz9t-shard-00-01.0qbmn57.mongodb.net:27017,ac-dn8bz9t-shard-00-02.0qbmn57.mongodb.net:27017/crmos?ssl=true&replicaSet=atlas-1i116o-shard-0&authSource=admin&retryWrites=true&w=majority");
  const industries = await Industry.find({});
  console.log("Found industries:");
  for (const ind of industries) {
    console.log(ind.name, ind._id);
    if (ind.name.toLowerCase().replace(/ /g, '') !== 'realestate') {
      console.log(`Deleting ${ind.name}...`);
      await Industry.deleteOne({ _id: ind._id });
    }
  }
  process.exit(0);
}

run().catch(console.error);
