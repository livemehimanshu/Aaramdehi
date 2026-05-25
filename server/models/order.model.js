import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User", // ✅ User model ka naam 'User' hai
        required: true
    },
    orderNumber: {
        type: String,
        required: true,
        unique: true // ✅ orderNumber ka unique index
    },
    orderItems: [{
        productId: {
            type: mongoose.Schema.ObjectId,
            ref: "Product", // ✅ Product model ka naam 'Product' hai
            required: true
        },
        name: String,
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        image: String
    }],
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        postalCode: String,
        mobile: String
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: ['cod', 'card', 'emi', 'netbanking', 'upi'] // सभी संभावित पेमेंट मेथड्स
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    }
}, {
    timestamps: true
});

export default mongoose.model("Order", orderSchema);