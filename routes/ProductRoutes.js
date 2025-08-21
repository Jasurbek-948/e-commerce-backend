const express = require("express");
const { getProducts, addProduct, deleteProduct, updateProduct, getPromotions, getFreeProducts } = require("../controllers/ProductController");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");

// 📌 Mahsulot rasm yuklash uchun yangi yo‘nalish
router.post("/uploads", upload.array("images", 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Kamida 2 ta rasm yuklash kerak!" });
    }
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(200).json({ imageUrls });
});

// 📌 Barcha mahsulotlar uchun API yo‘nalishlari
router.get("/", getProducts);
router.post("/", upload.array("images", 5), addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/promotions", getPromotions);
router.get("/free", getFreeProducts);
module.exports = router;
