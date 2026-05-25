import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // ✅ Order model ka naam 'Order' hai
      required: [true, "Order ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ User model ka naam 'User' hai
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "net_banking", "wallet", "cod"],
      required: [true, "Payment method is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true, // ✅ Index 1: Automatically created by Mongoose
      required: [true, "Transaction ID is required"],
    },
    paymentGateway: {
      type: String,
      enum: ["razorpay", "stripe", "paypal", "manual"],
      required: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    cardDetails: {
      cardLast4: String,
      cardBrand: String,
      cardExpiry: String,
    },
    upiId: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    nextRetryDate: {
      type: Date,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    reconciled: {
      type: Boolean,
      default: false,
    },
    receipientInfo: {
      name: String,
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

/**
 * 🛠️ MANUAL INDEXES SECTION
 */
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// ❌ REMOVED: paymentSchema.index({ transactionId: 1 });
// Kyunki upar unique: true ki wajah se warning aa rahi thi.

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;