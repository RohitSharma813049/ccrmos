export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface IInvoiceInput {
  items?: IInvoiceItem[];
  amount?: number; // Base amount fallback if items are empty
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  shippingFee?: number;
  currency?: string;
}

export interface IInvoiceCalculatedResult {
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  shippingFee: number;
  amount: number; // Grand Total
  currency: string;
}

/**
 * Pure backend calculation engine for Invoice & Billing totals.
 * Calculates line-item amounts, subtotal, discount, tax, and grand total.
 */
export function calculateInvoice(input: IInvoiceInput): IInvoiceCalculatedResult {
  const itemsInput = Array.isArray(input.items) ? input.items : [];
  
  // Calculate line item amounts and subtotal
  let calculatedSubtotal = 0;
  const processedItems = itemsInput.map((item) => {
    const qty = Math.max(0, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.unitPrice) || 0);
    const itemAmount = Math.round(qty * price * 100) / 100;
    calculatedSubtotal += itemAmount;

    return {
      description: item.description || "Line Item",
      quantity: qty,
      unitPrice: price,
      amount: itemAmount,
    };
  });

  // If no line items were provided, fallback to input base amount or subtotal
  if (processedItems.length === 0) {
    calculatedSubtotal = Math.max(0, Number(input.subtotal) || Number(input.amount) || 0);
  }

  calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;

  // Discount Calculation
  const discountRate = Math.max(0, Math.min(100, Number(input.discountRate) || 0));
  let discountAmount = 0;
  if (discountRate > 0) {
    discountAmount = Math.round(calculatedSubtotal * (discountRate / 100) * 100) / 100;
  } else if (input.discountAmount && Number(input.discountAmount) > 0) {
    discountAmount = Math.min(calculatedSubtotal, Number(input.discountAmount));
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);

  // Tax Calculation
  const taxRate = Math.max(0, Math.min(100, Number(input.taxRate) || 0));
  let taxAmount = 0;
  if (taxRate > 0) {
    taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
  } else if (input.taxAmount && Number(input.taxAmount) > 0) {
    taxAmount = Math.round(Number(input.taxAmount) * 100) / 100;
  }

  // Shipping Fee
  const shippingFee = Math.max(0, Math.round((Number(input.shippingFee) || 0) * 100) / 100);

  // Grand Total Calculation
  const grandTotal = Math.max(0, Math.round((taxableAmount + taxAmount + shippingFee) * 100) / 100);

  return {
    items: processedItems,
    subtotal: calculatedSubtotal,
    taxRate,
    taxAmount,
    discountRate,
    discountAmount,
    shippingFee,
    amount: grandTotal,
    currency: input.currency || "USD",
  };
}
