const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/* Google orqali tizimga kirish */
exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ message: "Google tokeni yo‘q!" });

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, name, picture } = ticket.getPayload();
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({ email, fullName: name, avatar: picture });
            await user.save();
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Google orqali tizimga kirdingiz!", token, user });
    } catch (error) {
        console.error("Google orqali kirishda xatolik:", error);
        res.status(500).json({ message: "Google orqali kirishda xatolik!", error: error.message });
    }
};

/* Foydalanuvchi ma'lumotlarini olish */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-otpCode");
        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi!", error: error.message });
    }
};

/* Email orqali OTP yuborish */
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Emailni kiriting!" });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otpCode, 10);

        let user = await User.findOne({ email });

        if (user && user.otpCode && Date.now() - user.createdAt < 5 * 60 * 1000) {
            return res.status(400).json({ message: "Avval yuborilgan koddan foydalaning!" });
        }

        if (!user) {
            user = new User({ email, otpCode: hashedOtp });
        } else {
            user.otpCode = hashedOtp;
        }

        await user.save();

        await transporter.sendMail({
            from: '"MyShop" <themessengeruz@gmail.com>',
            to: email,
            subject: "Tasdiqlash kodi",
            text: `Sizning tasdiqlash kodingiz: ${otpCode}`,
        });

        res.status(200).json({ message: "Tasdiqlash kodi yuborildi!" });
    } catch (error) {
        res.status(500).json({ message: "OTP yuborishda xatolik!", error: error.message });
    }
};

/* OTP ni tasdiqlash va tizimga kirish */
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otpCode } = req.body;
        let user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Foydalanuvchi topilmadi!" });

        if (Date.now() - user.createdAt > 5 * 60 * 1000) {
            return res.status(400).json({ message: "OTP muddati tugagan! Qayta yuboring." });
        }

        const isMatch = await bcrypt.compare(otpCode, user.otpCode);
        if (!isMatch) return res.status(400).json({ message: "Noto‘g‘ri OTP!" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Tizimga kirdingiz!", token, user });
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi!", error: error.message });
    }
};

/* Foydalanuvchi profilini yangilash */
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, address, phone, username } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });

        const updatedData = {
            fullName: fullName || user.fullName,
            address: address || user.address,
            phone: phone || user.phone,
            username: username || user.username,
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        res.status(200).json({ message: "Profil yangilandi!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi!", error: error.message });
    }
};

/* Manzilni yangilash */
exports.updateAddress = async (req, res) => {
    try {
        const { address, lat, lng } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });

        const updatedData = {
            address: address || user.address,
            coordinates: lat && lng ? { lat, lng } : user.coordinates,
        };

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        res.status(200).json({ message: "Manzil yangilandi!", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Xatolik yuz berdi!", error: error.message });
    }
};

/* Tizimdan chiqish */
exports.logout = async (req, res) => {
    res.status(200).json({ message: "Foydalanuvchi tizimdan chiqdi!" });
};