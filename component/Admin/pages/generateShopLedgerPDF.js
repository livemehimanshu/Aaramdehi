import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates a professional Statement of Account / Ledger for a Partner Shop
 */
export const generateShopLedgerPDF = (shop, orders = []) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('en-GB');

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(16, 185, 129); // Emerald-500
  doc.setFont("helvetica", "bold");
  doc.text("AARAMDEHI", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Partner Statement of Account", 14, 26);

  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text("LEDGER STATEMENT", 130, 20);
  doc.setFontSize(9);
  doc.text(`Generated on: ${dateStr}`, 130, 26);

  // --- Shop Details ---
  doc.setDrawColor(230);
  doc.line(14, 32, 196, 32);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Account Holder:", 14, 42);
  doc.setFont("helvetica", "normal");
  doc.text(`${shop.name}`, 14, 48);
  doc.text(`Proprietor: ${shop.owner}`, 14, 53);
  doc.text(`Address: ${shop.address}, ${shop.city}`, 14, 58);
  doc.text(`Contact: ${shop.phone || shop.mobile || 'N/A'}`, 14, 63);

  doc.setFont("helvetica", "bold");
  doc.text("Account Status:", 130, 42);
  doc.setFontSize(14);
  doc.setTextColor(shop.outstandingBalance > 0 ? 220 : 0, shop.outstandingBalance > 0 ? 38 : 150, 38);
  doc.text(`Balance: INR ${Number(shop.outstandingBalance || 0).toLocaleString()}`, 130, 50);

  // --- Ledger Table ---
  const tableColumn = ["Date", "Order #", "Status", "Amount (Debit)"];
  const tableRows = orders.map(order => [
    new Date(order.createdAt).toLocaleDateString('en-GB'),
    `#${order.orderNumber || order._id?.slice(-6)}`,
    (order.status || 'Pending').toUpperCase(),
    `INR ${Number(order.totalAmount || 0).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 75,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [31, 41, 55] },
    styles: { fontSize: 9 },
    columnStyles: {
      3: { halign: 'right' }
    }
  });

  // --- Footer ---
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "italic");
  doc.text("Note: This statement lists credit orders only. Payments are reflected in the current balance.", 14, finalY);
  
  doc.setFontSize(8);
  doc.text("This is an electronically generated statement. No signature required.", 105, 285, { align: "center" });

  // --- Save ---
  const fileName = `Ledger_${shop.name.replace(/\s+/g, '_')}_${dateStr}.pdf`;
  doc.save(fileName);
};