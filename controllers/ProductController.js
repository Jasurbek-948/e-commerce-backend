const Product = require("../models/Product");

// 📌 Barcha mahsulotlarni olish
exports.getProducts = async (req, res) => {
    try {
        const { sort, limit, category } = req.query;
        let query = {};

        // ✅ Mahsulotni kategoriyaga ajratish
        if (category) {
            query.category = category;
        }

        let sortOption = {};
        if (sort === "most_sold") {
            sortOption = { sales: -1 }; // Eng ko‘p sotilgan mahsulotlar
        } else if (sort === "popular") {
            sortOption = { rating: -1 }; // Eng mashhur mahsulotlar
        } else if (sort === "new") {
            sortOption = { createdAt: -1 }; // Yangi qo‘shilgan mahsulotlar
        } else if (sort === "discount") {
            sortOption = { discount: -1 }; // Chegirmali mahsulotlar
        }

        const products = await Product.find(query).sort(sortOption).limit(Number(limit) || 10);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi", error });
    }
};

// 📌 Yangi mahsulot qo‘shish
exports.addProduct = async (req, res) => {
    try {
        console.log("🛠️ Kelgan ma’lumot:", req.body);
        console.log("📸 Yuklangan rasmlar:", req.files);

        if (!req.files || req.files.length < 2) {
            return res.status(400).json({ message: "Kamida 2 ta rasm yuklash kerak!" });
        }

        // 📌 Rasmlarni array shakliga o‘tkazish
        const images = req.files.map((file) => `/uploads/${file.filename}`);

        const {
            name, category, price, discount, stock, description,
            brand, model, size, color, material, warranty, madeIn, deliveryType
        } = req.body;

        // 📌 `price`, `discount`, `stock` ni raqamga o‘tkazish (NaN oldini olish)
        const parsedPrice = parseFloat(price) || 0;
        const parsedDiscount = parseFloat(discount || 0);
        const parsedStock = parseInt(stock) || 0;

        const newProduct = new Product({
            name: name || "Noma’lum",
            category: category || "Noma’lum",
            price: parsedPrice,
            discount: parsedDiscount,
            stock: parsedStock,
            description: description || "Noma’lum",
            images,
            brand: brand || "Noma’lum",
            model: model || "Noma’lum",
            size: size || "Noma’lum",
            color: color || "Noma’lum",
            material: material || "Noma’lum",
            warranty: warranty || "Noma’lum",
            madeIn: madeIn || "Noma’lum",
            deliveryType: deliveryType || "standard",
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("❌ Xatolik:", error.message);
        res.status(500).json({ message: "Ichki server xatosi!" });
    }
};

// 📌 Mahsulotni yangilash
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi" });
    }
};
exports.getFreeProducts = async (req, res) => {
    try {
        const freeProducts = await Product.find({ forFree: true });
        res.status(200).json(freeProducts);
    } catch (error) {
        res.status(500).json({ message: "Tekin mahsulotlarni olishda xatolik", error: error.message });
    }
};
exports.getPromotions = async (req, res) => {
    try {
        const promoProducts = await Product.find({ isPromotion: true, stock: { $gt: 0 } });
        res.status(200).json(promoProducts);
    } catch (error) {
        res.status(500).json({ message: "Aksiyalarni olishda xatolik!", error: error.message });
    }
};
// 📌 Mahsulotni o‘chirish
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Mahsulot o‘chirildi!" });
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi" });
    }
};
