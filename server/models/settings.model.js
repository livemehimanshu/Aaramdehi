import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Setting key is required"],
      unique: true, // ✅ Index 1: Mongoose ise automatically handle kar leta hai
      trim: true,
      uppercase: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Setting value is required"],
    },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "array"],
      default: "string",
    },
    label: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    category: {
      type: String,
      enum: [
        "general",
        "store",
        "email",
        "payment",
        "shipping",
        "seo",
        "security",
        "notification",
      ],
      default: "general",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    validationRule: {
      type: String,
      default: null,
    },
    updatedBy: {
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

// ❌ REMOVED: settingsSchema.index({ key: 1 }); 
// Kyunki unique: true ki wajah se warning aa rahi thi.

settingsSchema.index({ category: 1 }); // Ye theek hai, filtering mein kaam aayega.

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;