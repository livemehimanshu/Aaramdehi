import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    image: {
      type: String,
      required: [true, "Banner image is required"],
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    link: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["hero", "promotional", "seasonal", "category", "product", "bedroom"], // 'bedroom' yahan add karein
      default: "promotional",
    },
    position: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: new Date(),
    },
    endDate: {
      type: Date,
      default: null,
    },
    altText: {
      type: String,
      trim: true,
    },
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

// Index for faster queries
bannerSchema.index({ isActive: 1, category: 1 });
bannerSchema.index({ createdAt: -1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
