const express = require("express");
const multer = require("multer");
const path = require("path");
const {
    getBanners,
    addBanner,
    updateBanner,
    deleteBanner
} = require("../controllers/BannerController");

const router = express.Router();

// 📌 Multer orqali rasm yuklash (faqat jpg, png, webp)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 🔥 Fayl nomiga vaqt qo‘shish
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        return cb(new Error("❌ Faqat .jpg, .jpeg, .png yoki .webp yuklash mumkin!"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 🔥 Fayl hajmi cheklov: 2MB
});

// 📌 Rasm papkasini statik qilish (rasmlarni browserda ko‘rsatish uchun)
router.use("/uploads", express.static("uploads"));

// 📌 API marshrutlar
router.get("/", getBanners);
router.post("/", upload.single("image"), addBanner);
router.put("/:id", upload.single("image"), updateBanner);
router.delete("/:id", deleteBanner);

module.exports = router;
