import { NextResponse } from 'next/server';

import dbConnect from '@/lib/db';
import Invoice from '@/modules/invoices/schemas/Invoice';
import Pipeline from '@/modules/settings/schemas/Pipeline';
import { requireAuthenticatedUser, requirePermission } from '@/lib/auth-utils';
import { buildTenantQuery } from "@/lib/access-control";
import { getRecordScopeFilter } from "@/lib/permissions";
import { parseFiltersToMongo } from "@/utils/parseFilters";
import { calculateInvoice } from '@/lib/invoice-calculator';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'view');
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const filtersJson = searchParams.get("filters");
    const dynamicQuery = parseFiltersToMongo(filtersJson);

    const statusFilter = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";
    
    const queryScope = getRecordScopeFilter(user, "Invoices");
    const queryObj: any = { ...buildTenantQuery(user), ...dynamicQuery, ...queryScope };

    if (statusFilter) {
      queryObj.status = statusFilter;
    }

    if (dateFrom || dateTo) {
      queryObj.createdAt = {};
      if (dateFrom) queryObj.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        queryObj.createdAt.$lte = toDate;
      }
    }
    
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const searchOr = ['invoiceNumber', 'status'].map(field => ({ [field]: searchRegex }));
      queryObj.$or = queryObj.$or ? [...queryObj.$or, ...searchOr] : searchOr;
    }

    const skip = (page - 1) * limit;
    const total = await Invoice.countDocuments(queryObj);
    const invoices = await Invoice.find(queryObj).sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    // Backend calculation of total metrics across filtered query
    const summaryAgg = await Invoice.aggregate([
      { $match: queryObj },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalSubtotal: { $sum: "$subtotal" },
          totalTax: { $sum: "$taxAmount" },
          totalDiscount: { $sum: "$discountAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = summaryAgg[0] || {
      totalAmount: 0,
      totalSubtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      count: 0
    };

    return NextResponse.json({ 
      invoices, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) || 1,
      summary 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'create');
    const body = await req.json();

    if (user) {
      body.companyId = user.companyId;
      body.founderId = user.hierarchyLevel === 2 ? user.id : user.founderId;
      body.createdBy = user._id;
    }

    // Apply backend calculations to request payload
    const calc = calculateInvoice(body);
    Object.assign(body, calc);

    const newInvoice = await Invoice.create(body);
    return NextResponse.json({ invoice: newInvoice }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();
  try {
    const user = await requireAuthenticatedUser();
    await requirePermission('Invoices', 'edit');

    const body = await req.json();
    const { _id, status, ...updateData } = body;

    if (!_id) return NextResponse.json({ error: "Missing Invoice ID" }, { status: 400 });

    const invoice = await Invoice.findOne({ _id, ...buildTenantQuery(user) });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Enforce "forward-only" logic if status is changing
    if (status && invoice.status !== status) {
      let pipeline = await Pipeline.findOne({ companyId: user.companyId, module: "invoice" });
      
      let stages = pipeline?.stages || [
        { name: "Draft", order: 0 },
        { name: "Sent", order: 1 },
        { name: "Overdue", order: 2 },
        { name: "Paid", order: 3 },
      ];

      const currentStage = stages.find(s => s.name === invoice.status);
      const newStage = stages.find(s => s.name === status);

      if (currentStage && newStage) {
        if (newStage.order < currentStage.order) {
          return NextResponse.json({ 
            error: "Status can only move forward in the pipeline." 
          }, { status: 400 });
        }
      }
      
      invoice.status = status;
    }

    // Apply backend calculations to updateData if items/amounts/rates are being updated
    if (updateData.items || updateData.amount || updateData.subtotal || updateData.taxRate || updateData.discountRate || updateData.shippingFee) {
      const mergedInput = {
        items: updateData.items !== undefined ? updateData.items : invoice.items,
        amount: updateData.amount !== undefined ? updateData.amount : invoice.amount,
        subtotal: updateData.subtotal !== undefined ? updateData.subtotal : invoice.subtotal,
        taxRate: updateData.taxRate !== undefined ? updateData.taxRate : invoice.taxRate,
        discountRate: updateData.discountRate !== undefined ? updateData.discountRate : invoice.discountRate,
        discountAmount: updateData.discountAmount !== undefined ? updateData.discountAmount : invoice.discountAmount,
        shippingFee: updateData.shippingFee !== undefined ? updateData.shippingFee : invoice.shippingFee,
        currency: updateData.currency !== undefined ? updateData.currency : invoice.currency,
      };

      const calc = calculateInvoice(mergedInput);
      Object.assign(updateData, calc);
    }

    Object.assign(invoice, updateData);
    await invoice.save();

    return NextResponse.json({ invoice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

