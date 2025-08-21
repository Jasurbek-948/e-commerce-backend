const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    fileUrl: { type: String, default: null },
    messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    fromOperator: { type: Boolean, default: false },
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', default: null },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
});

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    messages: [messageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);