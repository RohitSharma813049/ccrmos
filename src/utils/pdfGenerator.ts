import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { formatCurrency } from "./currency";

export function generateInvoicePDF(invoice: any) {
  // Create a new PDF document in portrait, A4 format
  const doc = new jsPDF();

  // Primary colors
  const primaryColor = [79, 70, 229]; // Indigo-600
  const textColor = [55, 65, 81]; // Gray-700

  // 1. HEADER
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 14, 30);
  doc.text(`Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString()}`, 14, 36);
  doc.text(`Status: ${invoice.status}`, 14, 42);

  // 2. COMPANY INFO (Right side)
  doc.setFont("helvetica", "bold");
  doc.text("FROM:", 120, 22);
  doc.setFont("helvetica", "normal");
  doc.text("Your CRM Inc.", 120, 28);
  doc.text("123 Tech Lane, Silicon Valley", 120, 34);
  doc.text("contact@yourcrm.com", 120, 40);

  // 3. TABLE
  const tableColumn = ["Description", "Quantity", "Unit Price", "Total"];
  
  // Create a dummy line item based on the total amount
  const tableRows = [
    ["Professional Services", "1", formatCurrency(invoice.amount, invoice.currency || 'USD'), formatCurrency(invoice.amount, invoice.currency || 'USD')]
  ];

  (doc as any).autoTable({
    startY: 55,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255] },
    styles: { font: 'helvetica', fontSize: 10 },
  });

  // 4. TOTALS
  const finalY = (doc as any).lastAutoTable.finalY || 80;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Total Due: ${formatCurrency(invoice.amount, invoice.currency || 'USD')}`, 140, finalY + 15);

  // 5. FOOTER
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175); // Gray-400
  doc.text("Thank you for your business!", 14, 280);

  // Save the PDF
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
}
