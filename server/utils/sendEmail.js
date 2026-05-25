import sendEmail from "../config/sendEmail.js";
import { orderEmailTemplate } from "./orderEmailTemplate.js";

/**
 * sends order confirmation email to both customer and admin
 */
export const sendOrderEmail = async (userEmail, orderData) => {
    try {
        // 1. Send to Customer
        await sendEmail({
            sendTo: userEmail,
            subject: `Order Confirmed: ${orderData.orderNumber} - Aaramdehi`,
            html: orderEmailTemplate(orderData, "CUSTOMER")
        });

        // 2. Send to Admin (Notify store owner)
        await sendEmail({
            sendTo: process.env.EMAIL_USER,
            subject: `🚨 NEW ORDER: ${orderData.orderNumber}`,
            html: orderEmailTemplate(orderData, "ADMIN")
        });
    } catch (error) {
        console.error("Error in sendOrderEmail utility:", error);
    }
};