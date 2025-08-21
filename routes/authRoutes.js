const express = require('express');
const {
    sendOTP,
    verifyOTP,
    updateProfile,
    logout,
    googleLogin,
    getMe,
    updateAddress,
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/User');
const router = express.Router();


router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);
router.put('/profile', authMiddleware, updateProfile);
router.put('/address', authMiddleware, updateAddress);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);

router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Foydalanuvchi ma'lumotlarini olishda xato:", error.message);
        res.status(500).json({ message: "Server xatosi" });
    }
});

module.exports = router;