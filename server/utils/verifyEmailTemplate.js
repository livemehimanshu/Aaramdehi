const verifyEmailTemplate = ({ name, url }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            .container {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #dfdfdf;
                border-radius: 8px;
                overflow: hidden;
            }
            .header {
                background-color: #1a1a1a;
                padding: 40px 20px;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 28px;
                letter-spacing: 4px;
                text-transform: uppercase;
            }
            .hero {
                padding: 40px 30px;
                text-align: center;
                background-color: #f9f9f9;
            }
            .hero h2 {
                color: #333;
                font-size: 24px;
                margin-bottom: 10px;
            }
            .content {
                padding: 30px;
                color: #555555;
                line-height: 1.8;
            }
            .otp-container {
                margin: 30px 0;
                text-align: center;
            }
            .otp-code {
                display: inline-block;
                background-color: #fff4e5;
                color: #d35400;
                font-size: 42px;
                font-weight: bold;
                letter-spacing: 10px;
                padding: 20px 40px;
                border: 2px solid #e67e22;
                border-radius: 12px;
            }
            .features {
                background-color: #ffffff;
                padding: 20px;
                border-top: 1px solid #eee;
            }
            .feature-item {
                display: inline-block;
                width: 30%;
                text-align: center;
                font-size: 12px;
                color: #888;
            }
            .footer {
                background-color: #1a1a1a;
                padding: 30px;
                text-align: center;
                color: #888888;
                font-size: 12px;
            }
            .social-links a {
                color: #ffffff;
                text-decoration: none;
                margin: 0 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AARAMDEHI</h1>
                <p style="color: #888; margin-top: 10px; font-size: 14px;">Premium Home Furnishings</p>
            </div>

            <div class="hero">
                <h2>Email Verification</h2>
                <p>Hello <strong>${name}</strong>, thank you for choosing Aaramdehi. You are just one step away from transforming your home.</p>
            </div>

            <div class="content">
                <p>To verify your account, please use the following one-time password (OTP). Please note that this code is confidential and will expire in 10 minutes.</p>
                
                <div class="otp-container">
                    <div class="otp-code">${url}</div>
                </div>

                <p>If you did not request this, please ignore this email or contact our support team if you have any concerns.</p>
            </div>

            <div class="features">
                <div class="feature-item">
                    <strong>PREMIUM QUALITY</strong><br>Handpicked Fabrics
                </div>
                <div class="feature-item">
                    <strong>SECURE PAY</strong><br>100% Safe Payments
                </div>
                <div class="feature-item">
                    <strong>FAST DELIVERY</strong><br>Across India
                </div>
            </div>

            <div class="footer">
                <p>You received this email because you signed up on aaramdehi.com</p>
                <div class="social-links">
                    <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                </div>
                <p style="margin-top: 20px;">&copy; 2026 Aaramdehi India. Saharanpur, UP.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export default verifyEmailTemplate;