import sendEmail from "../config/sendEmail.js";
import { orderEmailTemplate } from "./orderEmailTemplate.js";

/**
 * sends order confirmation email to both customer and admin
 */
export const sendOrderEmail = async (userEmail, orderData) => {
    try {
        // ✅ 1. Send to Customer (With Order Number in Subject)
        await sendEmail({
            sendTo: userEmail,
            subject: `Order Confirmed: ${orderData.orderNumber} - Aaramdehi`,
            html: orderEmailTemplate(orderData, "CUSTOMER")
        });

        // ✅ 2. Send to Admin (Notify store owner about sale details)
        await sendEmail({
            sendTo: process.env.EMAIL_USER || "admin@aaramdehi.com",
            subject: `🚨 NEW SALE: ${orderData.orderNumber} (₹${(orderData.totalAmount || 0).toLocaleString()})`,
            html: orderEmailTemplate(orderData, "ADMIN")
        });
    } catch (error) {
        console.error("Error in sendOrderEmail utility:", error);
    }
};

export const sendOrderStatusEmail = async (userEmail, orderData, status) => {
    if (!userEmail || !status) return;
    await sendEmail({
        sendTo: userEmail,
        subject: `Order ${status}: ${orderData.orderNumber} - Aaramdehi`,
        html: orderEmailTemplate({ ...orderData, orderStatus: status }, "CUSTOMER")
    });
};

export const sendLowStockAlert = async (products) => {
    const recipient = process.env.EMAIL_USER;
    if (!recipient || !products.length) return;
    const rows = products.map((product) => `<li><strong>${product.name}</strong>: ${product.stock} remaining</li>`).join('');
    await sendEmail({
        sendTo: recipient,
        subject: `Low stock alert: ${products.length} product(s) - Aaramdehi`,
        html: `<h2>Aaramdehi low stock alert</h2><p>The following products need attention:</p><ul>${rows}</ul>`
    });
};