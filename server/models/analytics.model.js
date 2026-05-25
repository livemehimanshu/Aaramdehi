import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    pageUrl: {
      type: String,
      default: null,
    },
    pageViews: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversions: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    revenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    orders: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    deviceType: {
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
    },
    trafficSource: {
      organic: { type: Number, default: 0 },
      direct: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      paid: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
    },
    topPages: [
      {
        url: String,
        views: Number,
      },
    ],
    topProducts: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        views: Number,
        clicks: Number,
      },
    ],
    topKeywords: [
      {
        keyword: String,
        count: Number,
      },
    ],
    bounce_rate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    avg_session_duration: {
      type: Number,
      default: 0,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ User model ka naam 'User' hai
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
analyticsSchema.index({ date: -1 });
analyticsSchema.index({ pageUrl: 1, date: -1 });
analyticsSchema.index({ createdAt: -1 });

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
