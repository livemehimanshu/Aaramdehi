import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true, // ✅ Index 1: Mongoose ise automatically handle kar lega
      uppercase: true,
      trim: true,
      maxlength: [20, "Code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount cannot be negative"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: null,
    },
    applicableTo: {
      type: String,
      enum: ["all", "products", "categories"],
      default: "all",
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    usageLimit: {
      type: Number,
      default: null,
    },
    usagePerUser: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Un users ki list jinhone ye coupon already use kar liya hai
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ User model ka naam 'User' hai
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ User model ka naam 'User' hai
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * 🛠️ MANUAL INDEXES SECTION
 */

// ❌ REMOVED: couponSchema.index({ code: 1 }); 
// Kyunki upar unique: true ki wajah se index pehle se maujood hai.

couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ createdAt: -1 });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;