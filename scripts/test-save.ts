import { POST } from "../src/app/api/custom-modules/[moduleId]/records/route";
import dbConnect from "../src/lib/db";
import CustomModule from "../src/modules/settings/schemas/CustomModule";

async function run() {
  await dbConnect();
  
  // Find any existing module to get a real ID
  const mod = await CustomModule.findOne();
  if (!mod) {
    console.log("No custom module found");
    return;
  }

  const req = new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify({ data: { test: "me" } }),
  });

  const params = Promise.resolve({ moduleId: mod._id.toString() });

  try {
    const res = await POST(req as any, { params });
    console.log("Response Status:", res.status);
    console.log("Response Body:", await res.text());
  } catch (e) {
    console.error("Exception:", e);
  }
}

run();
