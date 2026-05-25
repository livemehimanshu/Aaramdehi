import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * PRODUCTION-READY EMAIL SERVICE
 * Sync with: registerUserController & verifyEmailController
 */

// Security Check: Server start hote hi credentials verify karein
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS missing in .env file!");
}

// SMTP Transporter setup (Secure & Pooled for performance)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // SSL/TLS for maximum security
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use 16-digit App Password
    },
    pool: true, // Multi-user requests handle karne ke liye
    maxConnections: 5,
    rateDelta: 1000,
    rateLimit: 5
});

/**
 * sendEmail function
 * Used by registerUserController to send 'verifyCode'
 */
const sendEmail = async ({ sendTo, subject, html }) => {
    try {
        // Sanity Check: Params check karein
        if (!sendTo || !html) {
            return { success: false, error: "Missing recipient or content" };
        }

        const mailOptions = {
            from: `"Aaramdehi Support" <${process.env.EMAIL_USER}>`,
            to: sendTo,
            subject: subject || "Action Required: Aaramdehi Verification",
            html: html,
            // Headers for inbox delivery optimization
            headers: {
                "X-Entity-Ref-ID": Date.now().toString(),
                "Importance": "high"
            }
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent to ${sendTo}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        // Security: Logs mein full error par user ko sirf simple message
        console.error("❌ Email Service Failure:", error.message);
        return { success: false, error: "Email delivery failed" };
    }
};

export default sendEmail;