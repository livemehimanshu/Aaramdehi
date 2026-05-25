import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * PRODUCTION-READY EMAIL SERVICE
 * Secure SMTP with Gmail
 */

// Verify credentials at startup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS not found in .env!");
    console.error("   Please set up: EMAIL_USER and EMAIL_PASS (16-digit App Password)");
}

// SMTP Transporter (Secure SSL/TLS)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL/TLS enabled
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // 16-digit Google App Password required
    },
    pool: true, // Connection pooling for better performance
    maxConnections: 5,
    rateLimit: 5 // 5 emails per second
});

// Test connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Service Connection Failed:", error.message);
        console.error("   Please verify EMAIL_USER and EMAIL_PASS in .env file");
    } else {
        console.log("✅ Email Service Ready - Connected to Gmail SMTP");
    }
});

/**
 * Send Email Function
 * Used by: registerUserController, loginController, forgotPasswordController
 */
const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        // Validate inputs
        if (!sendTo || !html) {
            throw new Error("Missing recipient email or content");
        }

        const mailOptions = {
            from: `"Aaramdehi Support" <${process.env.EMAIL_USER}>`,
            to: sendTo,
            subject: subject || "Action Required - Aaramdehi",
            html: html,
            headers: {
                "X-Entity-Ref-ID": Date.now().toString(),
                "Importance": "high"
            }
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent to ${sendTo} | Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ Email Send Failed:", error.message);
        return { success: false, error: error.message };
    }
};

export default sendEmail;