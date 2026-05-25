import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "provide a name"]
    },
    email: {
        type: String,
        required: [true, 'provide an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, "provide a password"]
    },
    avatar: {
        type: String,
        default: ""
    },
    mobile: {
        type: Number,
        default: null
    },
    refresh_token: { // Spelling theek ki (tooken -> token)
        type: String,
        default: ""
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    last_login_date: {
        type: Date,
        default: null // Date ke liye default null rakha hai
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Suspended"],
        default: "Active" // Case sensitive hota hai, 'Active' rakha hai
    },
    address_details: [{
        type: mongoose.Schema.ObjectId,
        ref: "address"
    }],
    shopping_cart: [{
        type: mongoose.Schema.ObjectId,
        ref: "cartItem" // Ref check kar lena, shayad cartItem ho
    }],
    orderHistory: [{
        type: mongoose.Schema.ObjectId,
        ref: "Order"
    }],
    forgot_password_otp: {
        type: String,
        default: ""
    },
    forgot_password_expiry: { // Spelling: forget -> forgot
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    }
}, {
    timestamps: true
});

// niche userSchema ka 'S' capital hona chahiye jo upar define kiya hai
const UserModel = mongoose.model("User", userSchema);

export default UserModel;