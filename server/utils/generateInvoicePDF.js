import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates a professional PDF invoice for Aaramdehi
 * @param {Object} order - The order data object
 */
export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  // --- Header & Branding ---
  doc.setFontSize(22);
  doc.setTextColor(239, 68, 68); // Red-500
  doc.setFont("helvetica", "bold");
  doc.text("AARAMDEHI", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Home Decor & Furniture", 14, 26);
  doc.text("www.aaramdehi.com", 14, 31);

  // --- Invoice Info ---
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246); // Blue-500
  doc.text("INVOICE", 150, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Invoice #: ${order.orderNumber || order.orderId || 'N/A'}`, 150, 28);
  doc.text(`Date: ${date}`, 150, 33);

  // --- Horizontal Line ---
  doc.setDrawColor(230);
  doc.line(14, 40, 196, 40);

  // --- Customer & Payment Details ---
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress?.fullName || order.address?.name || "Customer", 14, 56);
  doc.text(order.shippingAddress?.address || order.address?.address || "Address Not Provided", 14, 61);
  doc.text(`${order.shippingAddress?.city || order.address?.city || ''}, ${order.shippingAddress?.postalCode || order.address?.postalCode || ''}`, 14, 66);
  doc.text(`Phone: ${order.shippingAddress?.mobile || order.address?.phone || 'N/A'}`, 14, 71);

  doc.setFont("helvetica", "bold");
  doc.text("Payment Information:", 120, 50);
  doc.setFont("helvetica", "normal");
  const paymentMethodDisplay = order.paymentMethod?.toUpperCase() === 'COD' ? "Cash on Delivery" : "Credit/Debit Card";
  doc.text(`Method: ${paymentMethodDisplay}`, 120, 56);
  doc.text(`Status: ${order.paymentStatus || 'Pending'}`, 120, 61);

  // --- Items Table ---
  const tableColumn = ["Product Name", "Qty", "Price", "Subtotal"];
  const tableRows = [];

  const items = order.orderItems?.length > 0 
    ? order.orderItems 
    : order.items?.length > 0 
      ? order.items 
      : [{ name: "Product Purchase", quantity: 1, price: order.totalAmount || order.amount || 0 }];

  items.forEach(item => {
    const rowData = [
      item.name || "Item",
      item.quantity || 1,
      `INR ${(item.price || 0).toLocaleString()}`,
      `INR ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }, // Blue Header
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    }
  });

  // --- Summary Section ---
  const finalY = doc.lastAutoTable.finalY + 10;
  let currentY = finalY;

  // Show Discount row ONLY if a coupon was used
  if (order.couponCode || (order.discountAmount && order.discountAmount > 0)) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(22, 163, 74); // Green for discount
    doc.text(`Coupon Discount (${order.couponCode || 'Promo'}): -INR ${order.discountAmount.toLocaleString()}`, 140, currentY);
    currentY += 7;
  }

  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: INR ${(order.totalAmount || order.amount || 0).toLocaleString()}`, 140, currentY);

  // --- Footer ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont("helvetica", "italic");
  const footerY = 285;
  doc.text("This is a computer-generated invoice and does not require a physical signature.", 105, footerY, { align: "center" });
  doc.text("Thank you for choosing Aaramdehi for your home comfort needs.", 105, footerY + 5, { align: "center" });

  // --- Save File ---
  doc.save(`Invoice_${order.orderNumber || order.orderId}.pdf`);
};