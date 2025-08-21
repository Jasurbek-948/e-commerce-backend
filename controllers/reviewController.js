const Product = require("../models/Product");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Rasmni saqlash uchun papka
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Fayl nomi
    },
});
const upload = multer({ storage })
const uploadFields = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "productId" },
    { name: "rating" },
    { name: "comment" },
    { name: "userId" },
    { name: "userName" },
    { name: "userAvatar" },
]);
// ✅ Sharh qo‘shish (ro‘yxatdan o‘tgan yoki o‘tmagan foydalanuvchi)
exports.addReview = [
    uploadFields,
    async (req, res) => {
        try {
            const productId = req.body.productId;
            const rating = req.body.rating;
            const comment = req.body.comment;
            const userId = req.body.userId;
            const userName = req.body.userName;
            const userAvatar = req.body.userAvatar;
            const imageUrl = req.files?.image ? `/uploads/${req.files.image[0].filename}` : null;

            console.log("Kelayotgan ma'lumotlar:", { productId, rating, comment, userId, userName, userAvatar, imageUrl });

            if (!productId || !rating || !comment) {
                return res.status(400).json({ message: "Mahsulot ID, reyting va sharh majburiy!" });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: "Mahsulot topilmadi!" });
            }

            if (userId) {
                const existingReview = product.reviews.find(
                    (rev) => rev.user && rev.user.toString() === userId
                );
                console.log("Existing review check:", existingReview); // Debugging
                if (existingReview) {
                    return res.status(400).json({ message: "Siz allaqachon sharh qoldirgansiz!" });
                }
            }

            const newReview = {
                user: userId || null,
                userName: userName || "Nomalum foydalanuvchi",
                userAvatar: userAvatar || null,
                rating: Number(rating),
                comment,
                imageUrl,
                createdAt: new Date(),
            };

            product.reviews.push(newReview);

            product.rating =
                product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length;

            await product.save({ validateBeforeSave: false });

            res.status(201).json({ message: "Sharh muvaffaqiyatli qo‘shildi!", product });
        } catch (error) {
            console.error("❌ Sharh qo‘shishda xatolik:", error);
            res.status(500).json({ message: "Ichki server xatosi!" });
        }
    },
];
// ✅ Mahsulot sharhlarini olish
exports.getReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Mahsulot topilmadi!" });
        }

        res.status(200).json(product.reviews);
    } catch (error) {
        console.error("❌ Sharhlarni olishda xatolik:", error);
        res.status(500).json({ message: "Ichki server xatosi!" });
    }
};
