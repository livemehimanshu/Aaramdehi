export const orderEmailTemplate = (order, type = "CUSTOMER") => {
    const isCustomer = type === "CUSTOMER";
    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7;">
                <p style="margin: 0; font-weight: bold; color: #2d3748; font-size: 14px;">${item.name}</p>
                <p style="margin: 4px 0 0; color: #718096; font-size: 12px;">Qty: ${item.quantity}</p>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; color: #2d3748; font-weight: bold;">
                ₹${(item.price * item.quantity).toLocaleString()}
            </td>
        </tr>
    `).join('');

    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7fafc; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; text-transform: uppercase; letter-spacing: 2px; font-size: 24px;">Aaramdehi</h1>
                <p style="color: #bfdbfe; margin: 5px 0 0; font-size: 12px;">Premium Home Comfort</p>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #1a202c; margin-top: 0;">${isCustomer ? 'Order Confirmed!' : 'New Order Received!'}</h2>
                <p style="color: #4a5568; line-height: 1.6;">
                    ${isCustomer 
                        ? `Hi ${order.shippingAddress.name}, thank you for shopping with us. Your order has been placed and is currently being processed.` 
                        : `A new order has been placed on the store. Here are the details:`}
                </p>
                
                <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px dashed #cbd5e0;">
                    <p style="margin: 0; color: #718096; font-size: 12px; font-weight: bold; text-transform: uppercase;">Order Number</p>
                    <p style="margin: 5px 0 0; color: #1e3a8a; font-size: 18px; font-weight: 900;">${order.orderNumber}</p>
                </div>

                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <thead>
                        <tr>
                            <th style="text-align: left; color: #a0aec0; font-size: 10px; text-transform: uppercase; padding-bottom: 10px;">Item Details</th>
                            <th style="text-align: right; color: #a0aec0; font-size: 10px; text-transform: uppercase; padding-bottom: 10px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Summary -->
                <div style="float: right; width: 200px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #718096; font-size: 13px;">Subtotal:</span>
                        <span style="color: #2d3748; font-weight: bold; font-size: 13px;">₹${order.itemsPrice.toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #718096; font-size: 13px;">Shipping:</span>
                        <span style="color: #10b981; font-weight: bold; font-size: 13px;">${order.shippingPrice === 0 ? 'FREE' : '₹'+order.shippingPrice}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #edf2f7; margin-top: 10px;">
                        <span style="color: #1e3a8a; font-weight: 900; font-size: 16px;">Total Paid:</span>
                        <span style="color: #1e3a8a; font-weight: 900; font-size: 16px;">₹${order.totalAmount.toLocaleString()}</span>
                    </div>
                </div>
                <div style="clear: both;"></div>

                <!-- Shipping Info -->
                <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #edf2f7;">
                    <h4 style="color: #1a202c; margin: 0 0 10px; font-size: 14px; text-transform: uppercase;">Delivery Address</h4>
                    <p style="color: #718096; font-size: 13px; line-height: 1.5; margin: 0;">
                        ${order.shippingAddress.address}, ${order.shippingAddress.city}<br>
                        ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                        <strong>Phone:</strong> ${order.shippingAddress.mobile}
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-top: 1px solid #edf2f7;">
                <p style="color: #a0aec0; font-size: 11px; margin: 0;">&copy; ${new Date().getFullYear()} Aaramdehi. All rights reserved.</p>
                <div style="margin-top: 10px;">
                    <a href="https://aaramdehi.com/orders" style="color: #1e3a8a; font-weight: bold; font-size: 11px; text-decoration: none; text-transform: uppercase;">Track My Order</a>
                </div>
            </div>
        </div>
    </div>
    `;
};