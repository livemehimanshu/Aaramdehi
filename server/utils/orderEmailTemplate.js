export const orderEmailTemplate = (orderData, type = "CUSTOMER") => {
    const { orderNumber, orderItems, totalAmount, shippingAddress, paymentMethod } = orderData;
    
    const itemsHtml = orderItems.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
        </tr>
    `).join('');

    const title = type === "ADMIN" ? "New Order Received!" : "Order Confirmed!";
    const subTitle = type === "ADMIN" 
        ? `You have received a new order ${orderNumber}.` 
        : `Thank you for shopping with Aaramdehi. Your order ${orderNumber} has been placed successfully.`;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #111; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Aaramdehi</h1>
                <p style="color: #888; font-size: 12px; margin: 5px 0;">COMFORT REDEFINED</p>
            </div>
            <h2 style="color: #10b981;">${title}</h2>
            <p>${subTitle}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                    <tr style="background: #f9f9f9;">
                        <th style="padding: 10px; text-align: left;">Item</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 10px; font-weight: bold;">Total Amount</td>
                        <td style="padding: 10px; font-weight: bold; text-align: right;">₹${totalAmount}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
                <h3 style="margin-top: 0; font-size: 14px;">Shipping Address:</h3>
                <p style="margin: 0; font-size: 13px; color: #555;">
                    ${shippingAddress.fullName}<br>
                    ${shippingAddress.address}, ${shippingAddress.city}<br>
                    Mobile: ${shippingAddress.mobile}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 13px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>

            <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/orders" 
                   style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
                   Track Your Order
                </a>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #888; font-size: 12px;">
                <p>&copy; ${new Date().getFullYear()} Aaramdehi Premium Home Decor. All rights reserved.</p>
            </div>
        </div>
    `;
};