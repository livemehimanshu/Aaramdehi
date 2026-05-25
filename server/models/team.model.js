import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // ✅ Index 1: Mongoose ise automatically handle kar lega
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    designation: {
      type: String,
      enum: [
        "admin",
        "manager",
        "team_lead",
        "support_executive",
        "content_writer",
        "designer",
        "developer",
        "other",
      ],
      default: "team_lead",
    },
    department: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    profileImagePublicId: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    joinDate: {
      type: Date,
      default: Date.now, // Fixed: use function reference
    },
    reportingTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    permissions: [
      {
        type: String,
        enum: [
          "manage_products",
          "manage_orders",
          "manage_users",
          "manage_payments",
          "manage_refunds",
          "manage_coupons",
          "manage_banners",
          "manage_categories",
          "manage_analytics",
          "manage_appointments",
          "manage_team",
          "manage_settings",
          "view_reports",
          "manage_content",
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    salary: {
      type: Number,
      default: null,
    },
    workingHours: {
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "17:00" },
    },
    socialMedia: {
      linkedin: String,
      twitter: String,
      instagram: String,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

/**
 * 🛠️ MANUAL INDEXES SECTION
 */

// ❌ REMOVED: teamSchema.index({ email: 1 }); 
// Kyunki unique: true upar define hai, isliye warning aa rahi thi.

teamSchema.index({ isActive: 1 });
teamSchema.index({ designation: 1 });
teamSchema.index({ createdAt: -1 });

const Team = mongoose.model("Team", teamSchema);
export default Team;