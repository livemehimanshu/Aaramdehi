import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // ✅ Order model ka naam 'Order' hai
      required: [true, "Order ID is required"],
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment", // ✅ Payment model ka naam 'Payment' hai
      required: [true, "Payment ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ User model ka naam 'User' hai
      required: true,
    },
    refundAmount: {
      type: Number,
      required: [true, "Refund amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    refundType: {
      type: String,
      enum: ["full", "partial"],
      default: "full",
    },
    refundReason: {
      type: String,
      required: [true, "Refund reason is required"],
      enum: [
        "damaged_product",
        "wrong_product",
        "quality_issue",
        "customer_request",
        "duplicate_order",
        "other",
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "processed", "completed"],
      default: "requested",
    },
    approvalDate: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ User model ka naam 'User' hai
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    processedDate: {
      type: Date,
      default: null,
    },
    refundTransactionId: {
      type: String,
      default: null,
    },
    refundMethod: {
      type: String,
      enum: ["original_payment", "store_credit", "manual", "bank_transfer"],
      default: "original_payment",
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    itemsReturned: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        quantity: Number,
        returnCondition: String,
      },
    ],
    notes: {
      type: String,
      default: null,
    },
    customerFeedback: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
refundSchema.index({ orderId: 1 });
refundSchema.index({ userId: 1 });
refundSchema.index({ status: 1 });
refundSchema.index({ createdAt: -1 });

const Refund = mongoose.model("Refund", refundSchema);
export default Refund;
