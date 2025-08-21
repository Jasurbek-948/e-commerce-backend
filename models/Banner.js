const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true }, // 🌟 Rasim URL
    altText: { type: String, default: "Banner Image" }, // 🌟 Alternativ matn
    category: { type: String, required: false }, // 🌟 Kategoriya
    link: { type: String, required: true } // 🌟 Sahifaga yo‘naltirish uchun URL
});

module.exports = mongoose.model("Banner", bannerSchema);
