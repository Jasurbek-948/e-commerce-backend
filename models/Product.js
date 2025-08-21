const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userName: { type: String, default: "Nomalum foydalanuvchi" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    userAvatar: String,
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: {
        type: String,
        required: true,
        enum: ["fashion", "electronics", "home", "beauty", "sports", "others"],
    },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    brand: { type: String, default: "Noma’lum" },
    model: { type: String, default: null },
    size: { type: [String], default: [] },
    color: { type: [String], default: [] },
    material: { type: String, default: null },
    warranty: { type: String, default: null },
    madeIn: { type: String, default: "Noma’lum" },
    quantity: { type: Number, min: 1, default: 1 },
    deliveryType: {
        type: String,
        required: true,
        enum: ["standard", "express"],
        default: "standard",
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: [reviewSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    isPromotion: { type: Boolean, default: false }, // Aksiyada ekanligini ko‘rsatadi
    forFree: { type: Boolean, default: false }, // Yangi maydon: Tekin mahsulot
});

// Pre-save middleware: Agar forFree true bo'lsa, price 0 ga o'rnatiladi
productSchema.pre("save", function (next) {
    if (this.forFree) {
        this.price = 0;
    }
    next();
});

// Pre-update middleware: Agar forFree true bo'lsa, price 0 ga o'rnatiladi
productSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    if (update.forFree === true) {
        update.price = 0;
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);