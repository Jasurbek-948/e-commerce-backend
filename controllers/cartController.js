// const Cart = require("../models/Cart");

// // 📌 Foydalanuvchining savatini olish
// exports.getCart = async (req, res) => {
//     try {
//         console.log("🔍 Foydalanuvchining savatini olish so‘rovi:", req.user.userId);

//         let cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

//         if (!cart) {
//             console.log("⚠️ Savat topilmadi, bo‘sh javob qaytarilmoqda.");
//             return res.status(200).json({ items: [] });
//         }

//         console.log("✅ Foydalanuvchi savati topildi:", cart);
//         res.status(200).json(cart);
//     } catch (error) {
//         console.error("❌ Savatni olishda xatolik!", error);
//         res.status(500).json({ message: "Savatni olishda xatolik!", error: error.message });
//     }
// };

// // 📌 **Savatni sinxronizatsiya qilish (foydalanuvchi login qilgandan keyin)**
// exports.syncCart = async (req, res) => {
//     try {
//         console.log("🔄 Savat sinxronizatsiya so‘rovi:", req.body);
//         console.log("🔑 Kiruvchi foydalanuvchi ID:", req.user);

//         if (!req.user || !req.user.userId) {
//             console.log("⛔ Foydalanuvchi aniqlanmadi!");
//             return res.status(401).json({ message: "Avtorizatsiya talab qilinadi!" });
//         }

//         const { localCart } = req.body;
//         console.log("📌 Local Cart:", localCart);

//         let cart = await Cart.findOne({ user: req.user.userId });

//         if (!cart) {
//             console.log("🆕 Savat topilmadi, yangi savat yaratilmoqda...");
//             cart = new Cart({ user: req.user.userId, items: [] });
//         } else {
//             console.log("✅ Mavjud savat topildi:", cart);
//         }

//         localCart.forEach((localItem) => {
//             console.log("📌 Mahsulot tekshirilmoqda:", localItem);
//             const itemIndex = cart.items.findIndex(item => item.product.toString() === localItem._id);
//             if (itemIndex > -1) {
//                 console.log("🔄 Mahsulot savatda bor, miqdor oshirilmoqda:", localItem);
//                 cart.items[itemIndex].quantity += localItem.quantity;
//             } else {
//                 console.log("➕ Mahsulot yangi qo‘shilmoqda:", localItem);
//                 cart.items.push({ product: localItem._id, quantity: localItem.quantity });
//             }
//         });

//         console.log("✅ Yangi savat saqlanmoqda...");
//         await cart.save();
//         console.log("✅ Savat saqlandi!");

//         res.status(200).json({ cart });
//     } catch (error) {
//         console.error("❌ Savatni sinxronizatsiya qilishda xatolik!", error);
//         res.status(500).json({ message: "Savatni sinxronizatsiya qilishda xatolik!", error: error.message });
//     }
// };

// // 📌 **Mahsulot savatga qo‘shish**
// exports.addToCart = async (req, res) => {
//     try {
//         console.log("🛒 Mahsulot savatga qo‘shish so‘rovi:", req.body);

//         const { productId, quantity } = req.body;
//         let cart = await Cart.findOne({ user: req.user.userId });

//         if (!cart) {
//             console.log("🆕 Savat topilmadi, yangi savat yaratilmoqda...");
//             cart = new Cart({ user: req.user.userId, items: [{ product: productId, quantity }] });
//         } else {
//             console.log("✅ Mavjud savat topildi:", cart);

//             const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
//             if (itemIndex > -1) {
//                 console.log("🔄 Mahsulot oldin savatda bor, miqdor oshirilmoqda:", productId);
//                 cart.items[itemIndex].quantity += quantity;
//             } else {
//                 console.log("➕ Mahsulot yangi qo‘shilmoqda:", productId);
//                 cart.items.push({ product: productId, quantity });
//             }
//         }

//         console.log("✅ Savat saqlanmoqda...");
//         await cart.save();
//         console.log("✅ Mahsulot savatga qo‘shildi!");

//         res.status(200).json(cart);
//     } catch (error) {
//         console.error("❌ Mahsulot qo‘shishda xatolik!", error);
//         res.status(500).json({ message: "Mahsulot qo‘shishda xatolik!", error: error.message });
//     }
// };

// // 📌 **Mahsulot miqdorini yangilash**
// // 📌 **Mahsulot miqdorini yangilash**
// const mongoose = require("mongoose");

// exports.updateQuantity = async (req, res) => {
//     try {
//         const { productId, quantity } = req.body;
//         console.log("🔄 Mahsulot miqdorini yangilash so‘rovi:", { productId, quantity });

//         let cart = await Cart.findOne({ user: req.user.userId });

//         if (!cart) {
//             console.log("⛔ Savat topilmadi!");
//             return res.status(404).json({ message: "Savat topilmadi!" });
//         }

//         console.log("📦 Savat ichidagi mahsulotlar:", cart.items);

//         // 🔥 **Mahsulot ID** ni tekshirish
//         console.log("📥 Kelgan productId (string):", productId);

//         // ✅ Taqqoslash uchun **ObjectId** ni stringga o‘tkazish
//         const productIdStr = productId.toString();
//         console.log("🔄 productId string format:", productIdStr);

//         // 🔎 **Mahsulotni savatdan izlash**
//         const itemIndex = cart.items.findIndex(item => item.product.toString() === productIdStr);

//         console.log("🔎 Item index:", itemIndex);
//         if (itemIndex === -1) {
//             console.log("⛔ Mahsulot savatda yo‘q!");
//             console.log("📌 Savatda mavjud mahsulotlar ID-lari:", cart.items.map(item => item.product.toString()));
//             return res.status(404).json({ message: "Mahsulot savatda yo‘q!" });
//         }

//         // ✅ Yangi miqdorni o‘rnatish
//         cart.items[itemIndex].quantity = quantity;
//         await cart.save();

//         console.log("✅ Mahsulot miqdori yangilandi:", cart.items[itemIndex]);
//         res.status(200).json({ message: "Mahsulot miqdori yangilandi!", items: cart.items });
//     } catch (error) {
//         console.error("❌ Miqdorni yangilashda xatolik!", error);
//         res.status(500).json({ message: "Xatolik yuz berdi!", error: error.message });
//     }
// };

// // 📌 **Savatdan mahsulotni o‘chirish**
// exports.removeFromCart = async (req, res) => {
//     try {
//         console.log("🗑 Mahsulotni savatdan o‘chirish so‘rovi:", req.body);

//         const { productId } = req.body;
//         let cart = await Cart.findOne({ user: req.user.userId });

//         if (!cart) {
//             console.log("⛔ Savat topilmadi!");
//             return res.status(404).json({ message: "Savat topilmadi!" });
//         }

//         console.log("✅ Mahsulot o‘chirilmoqda:", productId);
//         cart.items = cart.items.filter(item => item.product.toString() !== productId);
//         await cart.save();

//         console.log("✅ Mahsulot o‘chirildi va savat yangilandi!");
//         res.status(200).json(cart);
//     } catch (error) {
//         console.error("❌ Mahsulotni o‘chirishda xatolik!", error);
//         res.status(500).json({ message: "Mahsulotni o‘chirishda xatolik!", error: error.message });
//     }
// };




const Cart = require("../models/Cart");
exports.getCart = async (req, res) => {
    try {
        console.log("🔍 Foydalanuvchining savatini olish so‘rovi:", req.user.userId);

        // Foydalanuvchi savatini qidirish
        let cart = await Cart.findOne({ user: req.user.userId }).populate("items.product");

        if (!cart) {
            // Agar savat topilmasa, yangi savat yaratamiz
            console.log("⚠️ Savat topilmadi, yangi savat yaratilmoqda...");
            cart = new Cart({
                user: req.user.userId, // Foydalanuvchi ID’si required
                items: [] // Bo‘sh items massivi, schema ga mos
            });
            await cart.save();
            console.log("🆕 Yangi savat yaratildi:", cart);
        }

        console.log("✅ Foydalanuvchi savati topildi yoki yaratildi:", cart.items);
        res.status(200).json({ items: cart.items });
    } catch (error) {
        console.error("❌ Savatni olishda xatolik:", error);
        res.status(500).json({ message: "Savatni olishda xatolik!", error: error.message });
    }
};

exports.syncCart = async (req, res) => {
    try {
        console.log("🔄 Savat sinxronizatsiya so‘rovi:", req.body);
        const { cartItems } = req.body;

        if (!Array.isArray(cartItems)) {
            console.log("⛔ cartItems massiv bo‘lishi kerak!");
            return res.status(400).json({ message: "cartItems massiv bo‘lishi kerak!" });
        }

        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) {
            console.log("⚠️ Savat topilmadi, yangi savat yaratilmoqda...");
            cart = new Cart({
                user: req.user.userId,
                items: []
            });
        } else {
            console.log("✅ Mavjud savat topildi:", cart.items);
        }

        // Frontenddan kelgan cartItems bilan to‘liq sinxronlash
        const newItems = [];
        for (const localItem of cartItems) {
            const productId = localItem._id || localItem.product;
            const quantity = Number(localItem.quantity) || 1;

            if (!productId) {
                console.warn("⚠️ Noto‘g‘ri mahsulot o‘tkazib yuborildi:", localItem);
                continue;
            }

            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId.toString());
            if (itemIndex > -1) {
                console.log("🔄 Mahsulot mavjud, miqdor yangilanmoqda:", productId);
                cart.items[itemIndex].quantity = Math.max(1, quantity);
                newItems.push(cart.items[itemIndex]);
            } else {
                console.log("➕ Yangi mahsulot qo‘shilmoqda:", productId);
                newItems.push({ product: productId, quantity: Math.max(1, quantity) });
            }
        }

        // Frontendda yo‘q mahsulotlarni o‘chirish
        cart.items = newItems;

        await cart.save();
        await cart.populate("items.product");
        console.log("✅ Savat sinxronizatsiya qilindi:", cart.items);
        res.status(200).json({ items: cart.items });
    } catch (error) {
        console.error("❌ Savatni sinxronizatsiya qilishda xatolik:", error);
        res.status(500).json({ message: "Savatni sinxronizatsiya qilishda xatolik!", error: error.message });
    }
};
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: "Mahsulot qo‘shish uchun productId va quantity kerak!" });
        }

        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) {
            cart = new Cart({ user: req.user.userId, items: [] });
        }

        // Mavjud mahsulotni tekshirish
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex > -1) {
            // Agar mahsulot mavjud bo‘lsa, quantity ni oshirish
            cart.items[itemIndex].quantity = (cart.items[itemIndex].quantity || 0) + quantity;
        } else {
            // Agar mahsulot yangi bo‘lsa, qo‘shish
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        await cart.populate("items.product"); // Mahsulot ma’lumotlarini to‘ldirish
        console.log('✅ Saqlangan savat:', cart.items);
        return res.status(200).json({ items: cart.items });
    } catch (error) {
        console.error('❌ Xatolik:', error);
        return res.status(500).json({ message: "Mahsulot qo‘shishda xatolik!", error: error.message });
    }
};
exports.updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        console.log("🔄 Update so‘rovi:", { productId, quantity });
        if (!productId || quantity == null) {
            return res.status(400).json({ message: "Miqdorni yangilash uchun productId va quantity jo'natilishi kerak!" });
        }

        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) {
            return res.status(404).json({ message: "Savat mavjud emas. Iltimos, avval mahsulot qo‘shing." });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Mahsulot savatda topilmadi." });
        }

        if (quantity <= 0) {
            cart.items.splice(itemIndex, 1);
            console.log("🗑️ Mahsulot o‘chirildi:", productId);
        } else {
            cart.items[itemIndex].quantity = quantity;
            console.log("✅ Quantity yangilandi:", cart.items[itemIndex]);
        }

        await cart.save();
        await cart.populate("items.product");
        console.log("✅ Saqlangan savat:", cart.items);
        return res.status(200).json({ items: cart.items });
    } catch (error) {
        console.error("❌ Xatolik:", error);
        return res.status(500).json({ message: "Mahsulot miqdorini yangilashda xatolik!", error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: "Mahsulotni o‘chirish uchun productId jo'natilishi kerak!" });
        }

        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();
        await cart.populate("items.product");
        console.log('✅ Backenddan yangilangan items:', JSON.stringify(cart.items));
        return res.status(200).json({ items: cart.items });
    } catch (error) {
        console.error('❌ Backend xatolik:', error);
        return res.status(500).json({ message: "Mahsulotni o‘chirishda xatolik!", error: error.message });
    }
};
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.userId });
        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        cart.items = [];
        await cart.save();
        return res.status(200).json({ items: [] });
    } catch (error) {
        return res.status(500).json({ message: "Savatni tozalashda xatolik!", error: error.message });
    }
};

