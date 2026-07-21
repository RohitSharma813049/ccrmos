import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-utils";
import dbConnect from "@/lib/db";
import Lead from "@/modules/leads/schemas/Lead";
import Customer from "@/modules/customers/schemas/Customer";
import Invoice from "@/modules/invoices/schemas/Invoice";
import Project from "@/modules/projects/schemas/Project";
import Task from "@/modules/tasks/schemas/Task";

const MODEL_MAP: Record<string, any> = {
  leads: Lead,
  customers: Customer,
  invoices: Invoice,
  projects: Project,
  tasks: Task,
};

function flattenObject(ob: any): any {
  var toReturn: any = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null && !Array.isArray(ob[i]) && !(ob[i] instanceof Date) && ob[i].toString() === '[object Object]') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function jsonToCsv(items: any[]): string {
  if (!items || !items.length) return "";

  // Flatten items
  const flattened = items.map(i => flattenObject(i));

  // Get all unique keys
  const keys = Array.from(new Set(flattened.flatMap(Object.keys)));

  const csvRows = [];
  
  // Header
  csvRows.push(keys.map(k => `"${String(k).replace(/"/g, '""')}"`).join(","));

  // Rows
  for (const row of flattened) {
    const values = keys.map(k => {
      let val = row[k];
      if (val === null || val === undefined) val = "";
      else if (val instanceof Date) val = val.toISOString();
      else if (typeof val === 'object') val = JSON.stringify(val);
      else val = String(val);
      
      // Escape quotes
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get("module") || "";

    const Model = MODEL_MAP[moduleName];
    if (!Model) {
      return NextResponse.json({ error: "Invalid module specified for export." }, { status: 400 });
    }

    await dbConnect();

    // Enforce data isolation
    const companyId = session.user.companyId;
    const records = await Model.find({ companyId }).lean();

    const csvStr = jsonToCsv(records);

    return new NextResponse(csvStr, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${moduleName}_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
