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