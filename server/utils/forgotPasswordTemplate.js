/**
 * @description Professional & Secure Forgot Password Email Template for Aaramdehi
 * @param {string} name - User's Name
 * @param {string} otp - Secure 6-Digit OTP
 */
const forgotPasswordTemplate = ({ name, otp }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            .main-body {
                background-color: #f4f4f4;
                padding: 40px 10px;
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #1a1a1a; /* Sleek Black */
                padding: 40px;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                letter-spacing: 6px;
                text-transform: uppercase;
                font-size: 26px;
            }
            .content {
                padding: 40px;
                color: #333333;
                text-align: center;
            }
            .content h2 {
                font-size: 22px;
                color: #1a1a1a;
                margin-bottom: 20px;
            }
            .content p {
                line-height: 1.6;
                color: #666;
                margin-bottom: 30px;
            }
            .otp-box {
                background-color: #f9f9f9;
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 20px;
                display: inline-block;
                margin-bottom: 30px;
            }
            .otp-code {
                font-size: 44px;
                font-weight: 900;
                color: #e67e22; /* Signature Orange */
                letter-spacing: 12px;
                margin-bottom: 10px;
            }
            .security-note {
                background-color: #fff9f4;
                border-left: 4px solid #e67e22;
                padding: 15px;
                text-align: left;
                margin-top: 30px;
                font-size: 13px;
                color: #d35400;
            }
            .footer {
                padding: 30px;
                background-color: #fcfcfc;
                text-align: center;
                border-top: 1px solid #eeeeee;
                color: #999999;
                font-size: 12px;
            }
        </style>
    </head>
    <body class="main-body">
        <div class="container">
            <div class="header">
                <h1>AARAMDEHI</h1>
                <div style="color: #666; font-size: 12px; margin-top: 5px;">SECURE ACCESS</div>
            </div>

            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hello <strong>${name}</strong>, <br> We received a request to reset your password for your Aaramdehi account. Use the secure code below to proceed:</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div style="font-size: 11px; color: #999; letter-spacing: 1px;">VALID FOR 10 MINUTES</div>
                </div>

                <div class="security-note">
                    <strong>Security Alert:</strong> If you did not request this password reset, please ignore this email or contact support immediately if you suspect unauthorized access.
                </div>
            </div>

            <div class="footer">
                <p>This is an automated security email. Please do not reply.</p>
                <p style="margin-top: 15px;">&copy; 2026 Aaramdehi Home Furnishings. <br> Saharanpur, Uttar Pradesh, India.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export default forgotPasswordTemplate;