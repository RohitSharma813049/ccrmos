import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "./currency";

export function generateInvoicePDF(invoice: any) {
  // Create a new PDF document in portrait, A4 format
  const doc = new jsPDF();

  // Primary colors
  const primaryColor = [79, 70, 229]; // Indigo-600
  const textColor = [55, 65, 81]; // Gray-700
  const currency = invoice.currency || 'USD';

  // 1. HEADER
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice Number: ${invoice.invoiceNumber || invoice.displayId || 'INV-0000'}`, 14, 30);
  doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 14, 36);
  doc.text(`Status: ${invoice.status || 'Unpaid'}`, 14, 42);

  // 2. COMPANY INFO (Right side)
  doc.setFont("helvetica", "bold");
  doc.text("FROM:", 120, 22);
  doc.setFont("helvetica", "normal");
  doc.text("Your CRM Inc.", 120, 28);
  doc.text("123 Tech Lane, Silicon Valley", 120, 34);
  doc.text("contact@yourcrm.com", 120, 40);

  // 3. TABLE
  const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
  
  let tableRows: any[] = [];
  if (Array.isArray(invoice.items) && invoice.items.length > 0) {
    tableRows = invoice.items.map((item: any) => [
      item.description || "Line Item",
      String(item.quantity || 1),
      formatCurrency(item.unitPrice || 0, currency),
      formatCurrency(item.amount || (item.quantity * item.unitPrice) || 0, currency)
    ]);
  } else {
    const subtotal = invoice.subtotal || invoice.amount || 0;
    tableRows = [
      ["Professional Services", "1", formatCurrency(subtotal, currency), formatCurrency(subtotal, currency)]
    ];
  }

  (doc as any).autoTable({
    startY: 55,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { font: 'helvetica', fontSize: 10 },
  });

  // 4. TOTALS BREAKDOWN (Calculated by Backend)
  let finalY = (doc as any).lastAutoTable.finalY || 80;
  finalY += 10;

  const subtotal = invoice.subtotal || invoice.amount || 0;
  const taxAmount = invoice.taxAmount || 0;
  const discountAmount = invoice.discountAmount || 0;
  const shippingFee = invoice.shippingFee || 0;
  const grandTotal = invoice.amount || (subtotal - discountAmount + taxAmount + shippingFee);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  doc.text(`Subtotal:`, 130, finalY);
  doc.text(`${formatCurrency(subtotal, currency)}`, 175, finalY, { align: "right" });

  if (discountAmount > 0) {
    finalY += 6;
    doc.text(`Discount (${invoice.discountRate || 0}%):`, 130, finalY);
    doc.text(`-${formatCurrency(discountAmount, currency)}`, 175, finalY, { align: "right" });
  }

  if (taxAmount > 0) {
    finalY += 6;
    doc.text(`Tax (${invoice.taxRate || 0}%):`, 130, finalY);
    doc.text(`+${formatCurrency(taxAmount, currency)}`, 175, finalY, { align: "right" });
  }

  if (shippingFee > 0) {
    finalY += 6;
    doc.text(`Shipping Fee:`, 130, finalY);
    doc.text(`+${formatCurrency(shippingFee, currency)}`, 175, finalY, { align: "right" });
  }

  finalY += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Grand Total:`, 130, finalY);
  doc.text(`${formatCurrency(grandTotal, currency)}`, 175, finalY, { align: "right" });

  // 5. FOOTER
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175); // Gray-400
  doc.text("Thank you for your business!", 14, 280);

  // Save the PDF
  doc.save(`Invoice_${invoice.invoiceNumber || invoice.displayId || 'INV'}.pdf`);
}
