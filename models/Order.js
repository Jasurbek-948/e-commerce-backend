// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "cancelled"],
        default: "pending",
    },
    items: [{
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        stateProvince: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
});

module.exports = mongoose.model("Order", orderSchema);