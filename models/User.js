// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' }, // Google profil rasmi uchun
    otpCode: { type: String, default: '' }, // OTP saqlash uchun
    createdAt: { type: Date, default: Date.now },
    phone: { type: String, unique: true, sparse: true },
    username: { type: String, unique: true },
    isOnline: { type: Boolean, default: false }, // Qo‘shildi
    lastActive: { type: Date, default: Date.now }, // Qo‘shildi
});

module.exports = mongoose.model('User', userSchema);