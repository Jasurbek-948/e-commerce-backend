const Banner = require("../models/Banner");
const fs = require("fs");
const path = require("path");

// 📌 Barcha bannerlarni olish
exports.getBanners = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        if (type) {
            query.type = type;
        }

        const banners = await Banner.find(query);
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi", error });
    }
};

// 📌 Yangi banner qo‘shish
exports.addBanner = async (req, res) => {
    try {
        const { link } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "❌ Rasm yuklanishi shart!" });
        }

        if (!link) {
            return res.status(400).json({ message: "❌ Banner linki bo‘lishi shart!" });
        }

        const imageUrl = `uploads/${req.file.filename}`; // ✅ Rasm saqlash

        const newBanner = new Banner({
            imageUrl,
            link
        });

        await newBanner.save();
        res.status(201).json({ message: "✅ Banner qo‘shildi!", banner: newBanner });

    } catch (error) {
        console.error("❌ Banner qo‘shishda xatolik:", error);
        res.status(500).json({ message: "Xatolik yuz berdi", error });
    }
};


// 📌 Bannerni yangilash
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, buttonText, link } = req.body;

        // 🔹 Yangi rasm yuklangan bo'lsa, eski rasmni o'chiramiz
        let image = req.file ? `uploads/${req.file.filename}` : req.body.image;

        // 🔥 Eski rasmni o‘chirish (agar rasm yangilangan bo‘lsa)
        if (req.file) {
            const oldBanner = await Banner.findById(id);
            if (oldBanner.image) {
                fs.unlinkSync(path.join(__dirname, "..", oldBanner.image));
            }
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            id,
            { type, title, buttonText, link, image },
            { new: true }
        );

        if (!updatedBanner) return res.status(404).json({ message: "Banner topilmadi!" });

        res.status(200).json({ message: "✅ Banner yangilandi!", banner: updatedBanner });
    } catch (error) {
        console.error("❌ Banner yangilashda xatolik:", error);
        res.status(500).json({ message: "Xatolik yuz berdi", error });
    }
};

// 📌 Bannerni o‘chirish
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await Banner.findById(id);
        if (!banner) return res.status(404).json({ message: "Banner topilmadi!" });

        // 🔥 Eski rasmni serverdan o‘chirish
        if (banner.image) {
            fs.unlinkSync(path.join(__dirname, "..", banner.image));
        }

        await Banner.findByIdAndDelete(id);
        res.status(200).json({ message: "✅ Banner o‘chirildi!" });
    } catch (error) {
        console.error("❌ Banner o‘chirishda xatolik:", error);
        res.status(500).json({ message: "Xatolik yuz berdi", error });
    }
};
