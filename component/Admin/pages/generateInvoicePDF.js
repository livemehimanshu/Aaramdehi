import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates a professional PDF invoice for Aaramdehi
 * @param {Object} order - The order data object
 */
export const generateInvoicePDF = (order) => {
  try {
    if (!order) {
      throw new Error("Order data is missing or null");
    }

    const doc = new jsPDF();
    console.log("✅ jsPDF instance created successfully");
    
    // ✅ Check if autoTable is available
    if (!doc.autoTable) {
      console.warn("⚠️ autoTable not available, using fallback simple table");
      generateSimpleInvoice(order, doc);
      return;
    }
    console.log("✅ autoTable is available - proceeding with full invoice");

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
  doc.text(order.shippingAddress?.fullName || order.address?.name || order.customerName || "Customer", 14, 56);
  doc.text(order.shippingAddress?.address || order.address?.address || order.shippingAddress?.detail || "Address pending...", 14, 61);
  doc.text(`${order.shippingAddress?.city || order.address?.city || ''}, ${order.shippingAddress?.postalCode || order.address?.postalCode || order.address?.pincode || ''}`, 14, 66);
  doc.text(`Phone: ${order.shippingAddress?.mobile || order.shippingAddress?.phone || order.mobile || order.phone || order.address?.mobile || 'N/A'}`, 14, 71);

  doc.setFont("helvetica", "bold");
  doc.text("Payment Information:", 120, 50);
  doc.setFont("helvetica", "normal");
  const paymentMethodDisplay = order.paymentMethod?.toUpperCase() === 'COD' ? "Cash on Delivery" : "Credit/Debit Card";
  doc.text(`Method: ${paymentMethodDisplay}`, 120, 56);
  doc.text(`Status: ${order.paymentStatus || 'Pending'}`, 120, 61);

  // --- Items Table ---
  const tableColumn = ["Product Name", "Qty", "Price", "Subtotal"];
  const tableRows = [];

  // Handle various item array formats and provide a fallback row if empty
  const items = (order.orderItems?.length > 0) ? order.orderItems : 
                (order.items?.length > 0) ? order.items : 
                (order.products?.length > 0) ? order.products :
                [{ 
                    name: order.productName || "Product Purchase", 
                    quantity: 1, 
                    price: order.totalAmount || order.amount || 0 
                }];

  items.forEach(item => {
    const rowData = [
      item.name || item.productName || "Product",
      item.quantity || item.qty || 1,
      `INR ${(item.price || item.sellingPrice || 0).toLocaleString()}`,
      `INR ${((item.price || item.sellingPrice || 0) * (item.quantity || item.qty || 1)).toLocaleString()}`
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
  let currentY = 85;
  
  // ✅ Safe check for autoTable results
  if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
    currentY = doc.lastAutoTable.finalY + 10;
  }

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
  doc.text(`Total Payable: INR ${(order.totalAmount || order.totalPrice || order.amount || 0).toLocaleString()}`, 140, currentY);

  // --- Footer ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.setFont("helvetica", "italic");
  const footerY = 285;
  doc.text("This is a computer-generated invoice and does not require a physical signature.", 105, footerY, { align: "center" });
  doc.text("Thank you for choosing Aaramdehi for your home comfort needs.", 105, footerY + 5, { align: "center" });

  // --- Save File ---
  const finalId = order.orderNumber || order.orderId || order._id || order.id || 'XXXXX';
  doc.save(`Invoice_${finalId}.pdf`);
  console.log(`✅ Invoice PDF downloaded: Invoice_${finalId}.pdf`);
  } catch (error) {
    console.error("❌ Error generating invoice:", error);
    alert(`Invoice generation failed: ${error.message}`);
    throw error;
  }
};

// ✅ Fallback function if autoTable is not available
const generateSimpleInvoice = (order, doc) => {
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  // --- Header ---
  doc.setFontSize(22);
  doc.setTextColor(239, 68, 68);
  doc.setFont("helvetica", "bold");
  doc.text("AARAMDEHI", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Home Decor & Furniture", 14, 26);

  // --- Invoice Title ---
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text("INVOICE", 150, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Invoice #: ${order.orderNumber || order.orderId || 'N/A'}`, 150, 28);
  doc.text(`Date: ${date}`, 150, 35);

  // --- Bill To ---
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 14, 50);
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress?.fullName || order.address?.name || "Customer", 14, 56);
  doc.text(order.shippingAddress?.city || order.address?.city || '', 14, 62);

  // --- Items (Simple Table) ---
  let yPos = 75;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Item", 14, yPos);
  doc.text("Qty", 80, yPos);
  doc.text("Price", 110, yPos);
  doc.text("Subtotal", 150, yPos);

  // --- Draw line ---
  doc.setDrawColor(150);
  doc.line(14, yPos + 2, 200, yPos + 2);

  // --- Items rows ---
  yPos += 8;
  doc.setFont("helvetica", "normal");
  const items = order.orderItems?.length > 0 ? order.orderItems : 
                order.items?.length > 0 ? order.items : 
                [{ name: "Product", quantity: 1, price: order.totalAmount || 0 }];

  items.forEach((item) => {
    const itemName = (item.name || item.productName || "Product").substring(0, 40);
    doc.text(itemName, 14, yPos);
    doc.text(String(item.quantity || 1), 80, yPos);
    doc.text(`₹${(item.price || 0).toLocaleString()}`, 110, yPos);
    doc.text(`₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`, 150, yPos);
    yPos += 7;
  });

  // --- Total ---
  doc.setDrawColor(150);
  doc.line(14, yPos, 200, yPos);
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Total: ₹${(order.totalAmount || 0).toLocaleString()}`, 150, yPos);

  // --- Save ---
  const finalId = order.orderNumber || order.orderId || 'XXXXX';
  doc.save(`Invoice_${finalId}.pdf`);
  console.log(`✅ Simple invoice PDF downloaded: Invoice_${finalId}.pdf`);
};