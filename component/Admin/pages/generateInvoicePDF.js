import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * Generates a professional PDF invoice for Aaramdehi
 * @param {Object} order - The order data object
 */
const loadLogoDataUrl = async () => {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Invoice logo could not be loaded:', error.message);
    return null;
  }
};

export const generateInvoicePDF = async (order) => {
  try {
    if (!order) {
      throw new Error("Order data is missing or null");
    }

    const doc = new jsPDF();
    console.log("✅ jsPDF instance created successfully");
    
    // ✅ Check if autoTable is available
    if (!doc.autoTable) {
      console.warn("⚠️ autoTable not available, using fallback simple table");
      generateSimpleInvoice(order, doc, await loadLogoDataUrl());
      return;
    }
    console.log("✅ autoTable is available - proceeding with full invoice");

  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  const address = order.shippingAddress || order.address || {};
  const customer = typeof order.userId === 'object' ? order.userId : {};
  const customerName = address.fullName || address.name || customer.name || order.customerName || "Customer";
  const customerEmail = address.email || customer.email || order.email || "N/A";
  const customerPhone = address.mobile || address.phone || customer.mobile || order.mobile || order.phone || "N/A";
  const addressText = [
    address.address || address.detail || address.addressLine1 || address.street,
    address.addressLine2 || address.locality || address.landmark,
    address.city,
    address.state,
    address.postalCode || address.pincode
  ].filter(Boolean).join(', ');
  const paymentMethodDisplay = order.paymentMethod?.toUpperCase() === 'COD' ? "Cash on Delivery" : order.paymentMethod || "Online Payment";
  const money = (value) => `INR ${(Number(value) || 0).toLocaleString('en-IN')}`;

  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 14, 16, 58, 13);
  } else {
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("AARAMDEHI", 14, 25);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("PREMIUM HOME DECOR", 14, 31);
  }

  doc.setTextColor(25, 25, 25);
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.text("INVOICE", 196, 22, { align: "right" });
  doc.setFontSize(9);
  doc.text(`Invoice number: ${order.orderNumber || order.orderId || 'N/A'}`, 196, 29, { align: "right" });
  doc.text(`Invoice date: ${date}`, 196, 34, { align: "right" });

  doc.setDrawColor(215, 215, 215);
  doc.line(14, 43, 196, 43);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BILLED TO", 14, 53);
  doc.setFont("helvetica", "normal");
  doc.text(customerName, 14, 59);
  const wrappedAddress = doc.splitTextToSize(addressText || "Address pending", 94);
  doc.text(wrappedAddress, 14, 64, { lineHeightFactor: 1.25 });
  const contactY = 64 + (wrappedAddress.length * 4.5) + 3;
  doc.text(`Phone: ${customerPhone}`, 14, contactY);
  doc.text(`Email: ${customerEmail}`, 14, contactY + 5);

  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT DETAILS", 125, 53);
  doc.setFont("helvetica", "normal");
  doc.text(`Method: ${paymentMethodDisplay}`, 125, 59);
  doc.text(`Payment status: ${order.paymentStatus || 'Pending'}`, 125, 64);
  doc.text(`Order status: ${order.orderStatus || 'Processing'}`, 125, 69);

  const tableColumn = ["#", "Description", "Unit Price", "Qty", "Amount"];
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
    const quantity = item.quantity || item.qty || 1;
    const price = item.price || item.sellingPrice || 0;
    const rowData = [tableRows.length + 1, item.name || item.productName || "Product", money(price), quantity, money(price * quantity)];
    tableRows.push(rowData);
  });

  doc.autoTable({
    startY: Math.max(87, contactY + 14),
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [86, 24, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 245, 248] },
    styles: { fontSize: 8, cellPadding: 3, lineColor: [210, 210, 210], lineWidth: 0.2 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 82 },
      2: { halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { halign: 'right' },
    }
  });

  // --- Summary Section ---
  let currentY = (doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : 87) + 10;
  
  // ✅ Safe check for autoTable results
  const summaryX = 132;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(65, 65, 65);
  doc.text("Subtotal:", summaryX, currentY);
  doc.text(money(order.itemsPrice || tableRows.reduce((sum, row) => sum + (Number(String(row[4]).replace(/[^0-9.-]/g, '')) || 0), 0)), 196, currentY, { align: "right" });
  currentY += 6;
  if (Number(order.shippingPrice) > 0) {
    doc.text("Shipping:", summaryX, currentY);
    doc.text(money(order.shippingPrice), 196, currentY, { align: "right" });
    currentY += 6;
  }
  if (order.couponCode || (order.discountAmount && order.discountAmount > 0)) {
    doc.setTextColor(22, 163, 74); // Green for discount
    doc.text(`Discount (${order.couponCode || 'Promo'}):`, summaryX, currentY);
    doc.text(`-${money(order.discountAmount)}`, 196, currentY, { align: "right" });
    currentY += 6;
  }

  doc.setDrawColor(100, 100, 100);
  doc.line(summaryX, currentY, 196, currentY);
  currentY += 8;
  doc.setTextColor(25, 25, 25);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", summaryX, currentY);
  doc.text(money(order.totalAmount || order.totalPrice || order.amount), 196, currentY, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("PLEASE MAKE PAYMENT TO", 14, currentY + 18);
  doc.setFont("helvetica", "normal");
  doc.text("Aaramdehi Home Decor & Furniture", 14, currentY + 24);
  doc.text("Thank you for choosing Aaramdehi.", 14, currentY + 30);

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
const generateSimpleInvoice = (order, doc, logoDataUrl) => {
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

  // --- Header ---
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 14, 16, 58, 13);
  } else {
    doc.setFontSize(22);
    doc.setTextColor(239, 68, 68);
    doc.setFont("helvetica", "bold");
    doc.text("AARAMDEHI", 14, 20);
  }

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