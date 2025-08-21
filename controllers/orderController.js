// controllers/orderController.js
const Order = require("../models/Order");

// Yangi buyurtma yaratish
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;
        const userId = req.user?.userId;

        console.log("Request body:", req.body); // Frontenddan kelgan ma'lumot
        console.log("req.user:", req.user); // Token dekodlangan ma'lumot

        if (!userId) {
            return res.status(401).json({ message: "Foydalanuvchi autentifikatsiyadan o‘tmagan" });
        }

        if (!items || !totalAmount || !shippingAddress) {
            return res.status(400).json({ message: "Barcha maydonlar to‘ldirilishi shart" });
        }

        const order = new Order({
            userId,
            orderId: `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`,
            items,
            totalAmount,
            shippingAddress,
        });

        await order.save();
        console.log("Saved order:", order); // Saqlangan buyurtma
        res.status(201).json({ message: "Buyurtma muvaffaqiyatli yaratildi", order });
    } catch (error) {
        console.error("Buyurtma yaratishda xatolik:", error);
        res.status(500).json({ message: "Server xatosi" });
    }
};

// Foydalanuvchi buyurtmalarini olish
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.userId; // Bu yerda ham userId ishlatamiz
        console.log("getUserOrders userId:", userId);
        const orders = await Order.find({ userId }).sort({ date: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Buyurtmalarni olishda xatolik:", error);
        res.status(500).json({ message: "Server xatosi" });
    }
};

// Buyurtma holatini yangilash
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ message: "Buyurtma topilmadi" });
        }

        order.status = status;
        await order.save();
        res.status(200).json({ message: "Buyurtma holati yangilandi", order });
    } catch (error) {
        console.error("Buyurtma holatini yangilashda xatolik:", error);
        res.status(500).json({ message: "Server xatosi" });
    }
};

// Buyurtmani o'chirish
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOneAndDelete({ orderId });
        if (!order) {
            return res.status(404).json({ message: "Buyurtma topilmadi" });
        }
        res.status(200).json({ message: "Buyurtma o'chirildi" });
    } catch (error) {
        console.error("Buyurtmani o'chirishda xatolik:", error);
        res.status(500).json({ message: "Server xatosi" });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    updateOrderStatus,
    deleteOrder,
};