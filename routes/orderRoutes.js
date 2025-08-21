// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    updateOrderStatus,
    deleteOrder,
} = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");

// Yangi buyurtma yaratish
router.post("/", authMiddleware, createOrder);

// Foydalanuvchi buyurtmalarini olish
router.get("/my-orders", authMiddleware, getUserOrders);

// Buyurtma holatini yangilash (admin yoki foydalanuvchi uchun)
router.put("/:orderId/status", authMiddleware, updateOrderStatus);

// Buyurtmani o'chirish
router.delete("/:orderId", authMiddleware, deleteOrder);

module.exports = router;