const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📂 Agar `uploads/` papkasi mavjud bo‘lmasa, uni yaratish
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📌 Rasmlarni yuklash uchun `multer` sozlamasi
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // 📂 Rasmlar `uploads/` papkasiga saqlanadi
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // 🆕 Fayl nomini unikallash
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 📌 Maksimal fayl hajmi: 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            return cb(new Error("❌ Faqat rasmlar yuklash mumkin!"));
        }
    },
});

module.exports = upload;
