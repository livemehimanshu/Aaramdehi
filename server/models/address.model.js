import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address_line: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: ""
    },
    state: {
        type: String,
        default: ""
    },
    pincode: {
        type: String, // Pincode ko String mein rakhna behtar hai (leading zeros ke liye)
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    mobile: {
        type: Number,
        default: null
    },
    status: {
        type: Boolean,
        default: true
    },

    userId : {
        type:mongoose.Schema.ObjectId,
        default:""
    }
},
{ timestamps: true });

// Is model ko export kar rahe hain taaki hum controllers mein use kar sakein
export const AddressModel = mongoose.model("Address", addressSchema);

export default AddressModel